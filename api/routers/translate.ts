import { z } from "zod";
import { createRouter, adminMutation, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { settings } from "../../db/schema";
import { eq } from "drizzle-orm";

/**
 * AI auto-translation for the catalog (write once → fill all 5 languages).
 * Supports TWO providers — OpenAI and Anthropic (Claude). The admin enters
 * EITHER key in Settings; whichever key is present is used. Keys are stored in
 * the `settings` table (like SMTP/Meta/Ads keys) with a .env fallback. Keys are
 * never hardcoded and never returned to the client.
 *
 * Settings keys used:
 *   openai_api_key      · anthropic_api_key
 *   translate_provider  · "openai" | "anthropic" | "" (auto-detect)
 *   translate_model     · optional model override
 */

const LANGS = {
  az: "Azerbaijani",
  ru: "Russian",
  en: "English",
  tr: "Turkish",
  ar: "Arabic",
} as const;
type LangCode = keyof typeof LANGS;
const langEnum = z.enum(["az", "ru", "en", "tr", "ar"]);

async function getSetting(key: string): Promise<string | undefined> {
  try {
    const db = getDb();
    const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    const v = rows[0]?.value?.trim();
    return v ? v : undefined;
  } catch {
    return undefined;
  }
}

const SYSTEM =
  "You are a professional localizer for XURCUN, a premium Azerbaijani dried-fruit, nuts, sweets and gift boutique. " +
  "Translate the product/category text faithfully and idiomatically, keeping a refined, premium retail tone. " +
  "Keep brand and product names (Xurcun, Boxful, Khanedan, Selection, Edition, Carnaval, etc.) unchanged. " +
  "Do not add quotes, notes, or explanations. Return ONLY a JSON object whose keys are the requested language codes and whose values are the translations.";

function buildUserPrompt(text: string, source: LangCode, targets: LangCode[]) {
  const targetList = targets.map((t) => `"${t}" (${LANGS[t]})`).join(", ");
  return (
    `Source language: ${LANGS[source]} (${source}).\n` +
    `Translate this text into: ${targetList}.\n` +
    `Return a JSON object with exactly these keys: ${targets.join(", ")}.\n\n` +
    `Text:\n${text}`
  );
}

function parseJsonLoose(content: string): Record<string, string> {
  try {
    return JSON.parse(content);
  } catch {
    // tolerate models that wrap JSON in prose/code fences
    const m = content.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* fall through */
      }
    }
    throw new Error("Tərcümə cavabı düzgün formatda deyil.");
  }
}

async function viaOpenAI(text: string, source: LangCode, targets: LangCode[], apiKey: string, model: string) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(text, source, targets) },
      ],
    }),
  });
  if (!resp.ok) {
    const d = await resp.text().catch(() => "");
    throw new Error(`OpenAI xətası (${resp.status}): ${d.slice(0, 300)}`);
  }
  const data = (await resp.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI cavabı boşdur.");
  return parseJsonLoose(content);
}

async function viaAnthropic(text: string, source: LangCode, targets: LangCode[], apiKey: string, model: string) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      temperature: 0.2,
      system: SYSTEM,
      messages: [{ role: "user", content: buildUserPrompt(text, source, targets) }],
    }),
  });
  if (!resp.ok) {
    const d = await resp.text().catch(() => "");
    throw new Error(`Anthropic xətası (${resp.status}): ${d.slice(0, 300)}`);
  }
  const data = (await resp.json()) as any;
  const content = data?.content?.[0]?.text;
  if (!content) throw new Error("Anthropic cavabı boşdur.");
  return parseJsonLoose(content);
}

type Resolved = { provider: "openai" | "anthropic"; key: string; model: string };

async function resolveProvider(): Promise<Resolved> {
  const pref = (await getSetting("translate_provider"))?.toLowerCase();
  const modelOverride = await getSetting("translate_model");
  const openaiKey = (await getSetting("openai_api_key")) || process.env.OPENAI_API_KEY;
  const anthropicKey = (await getSetting("anthropic_api_key")) || process.env.ANTHROPIC_API_KEY;

  const wantOpenAI = pref === "openai";
  const wantAnthropic = pref === "anthropic";

  if (wantAnthropic && anthropicKey)
    return { provider: "anthropic", key: anthropicKey, model: modelOverride || "claude-3-5-haiku-latest" };
  if (wantOpenAI && openaiKey)
    return { provider: "openai", key: openaiKey, model: modelOverride || "gpt-4o-mini" };
  // auto-detect
  if (openaiKey) return { provider: "openai", key: openaiKey, model: modelOverride || "gpt-4o-mini" };
  if (anthropicKey)
    return { provider: "anthropic", key: anthropicKey, model: modelOverride || "claude-3-5-haiku-latest" };

  throw new Error(
    "Tərcümə xidməti qurulmayıb: Ayarlar bölməsində OpenAI və ya Anthropic (Claude) API açarını daxil edin.",
  );
}

export const translateRouter = createRouter({
  // Admin UI uses this to show "enabled" state + which provider is active.
  status: adminQuery.query(async () => {
    try {
      const r = await resolveProvider();
      return { enabled: true, provider: r.provider, model: r.model };
    } catch {
      return { enabled: false, provider: null as null | string, model: null as null | string };
    }
  }),

  // Translate one text from a source language into the others.
  toAll: adminMutation
    .input(
      z.object({
        text: z.string().min(1),
        source: langEnum.default("az"),
        targets: z.array(langEnum).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const all: LangCode[] = ["az", "ru", "en", "tr", "ar"];
      const targets = (input.targets ?? all).filter((t) => t !== input.source);
      const r = await resolveProvider();
      const result =
        r.provider === "anthropic"
          ? await viaAnthropic(input.text, input.source, targets, r.key, r.model)
          : await viaOpenAI(input.text, input.source, targets, r.key, r.model);
      return { provider: r.provider, [input.source]: input.text, ...result } as Record<string, string>;
    }),
});

import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

const SITE = "https://xurcun.az";

// Per-route <head> overrides for SPA-fallback routes. The static index.html carries
// the homepage meta; without this, every deep route (/catalog, /menu, …) was served
// with the homepage <title> and canonical=/ — telling Google they duplicate the home
// page. Homepage itself ("/") is served by serveStatic, so it keeps its static meta.
type RouteMeta = { title: string; desc?: string; h1: string; intro?: string };

const ROUTE_META: Record<string, RouteMeta> = {
  "/catalog": {
    title: "Kataloq | Xurcun — Quru meyvə, çərəz & hədiyyə",
    desc: "Xurcun kataloqu — quru meyvə, qoz-fındıq, çərəz, lokum, şokolad və hədiyyə qutuları. Bəyəndiyinizi seçin, WhatsApp ilə sifariş edin.",
    h1: "Xurcun Kataloqu — quru meyvə, çərəz, lokum və hədiyyə",
    intro: "Premium quru meyvə, qoz-fındıq, çərəz, lokum, şokolad və əl işi hədiyyə qutuları. Bəyəndiyinizi seçin, WhatsApp ilə sifariş edin.",
  },
  "/menu": {
    title: "Menyu | Xurcun — Quru meyvə, çərəz və hədiyyə",
    desc: "Xurcun QR menyusu — quru meyvə, qoz-fındıq, çərəz, lokum, şirniyyat və hədiyyə çeşidləri. Telefondan baxın, WhatsApp ilə sifariş edin.",
    h1: "Xurcun Menyu — quru meyvə, çərəz və hədiyyə",
    intro: "Mağaza menyusu — quru meyvə, qoz-fındıq, çərəz, lokum və şirniyyat çeşidləri. WhatsApp ilə sifariş edin.",
  },
  "/privacy": { title: "Məxfilik Siyasəti | Xurcun", h1: "Məxfilik Siyasəti — Xurcun" },
  "/cookie-policy": { title: "Cookie Siyasəti | Xurcun", h1: "Cookie Siyasəti — Xurcun" },
};

const SR_ONLY =
  "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Rewrite title + canonical + og + the sr-only SEO shell (h1/intro) for a deep route.
// Unknown routes (no override and not /menu/<slug>) keep the homepage meta/shell —
// harmless, since they render the homepage via the SPA "*" fallback anyway.
function injectRouteMeta(html: string, pathname: string): string {
  const meta = ROUTE_META[pathname] ?? (pathname.startsWith("/menu/") ? ROUTE_META["/menu"] : null);
  if (!meta) return html;
  const canonical = SITE + pathname;
  const title = escapeHtml(meta.title);
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
  if (meta.desc) {
    const desc = escapeHtml(meta.desc);
    out = out
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`);
  }
  const shell = `<!--seo-shell--><div style="${SR_ONLY}"><h1>${escapeHtml(meta.h1)}</h1>${meta.intro ? `<p>${escapeHtml(meta.intro)}</p>` : ""}</div><!--/seo-shell-->`;
  out = out.replace(/<!--seo-shell-->[\s\S]*?<!--\/seo-shell-->/, shell);
  return out;
}

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  app.use("*", serveStatic({ root: "./dist/public" }));

  // SPA fallback. Serve index.html for any client route (BrowserRouter paths like
  // /catalog, /menu) so crawlers and deep-links get 200 — NOT gated on the Accept
  // header (that previously returned 404 to Googlebot → pages unindexable). Only real
  // missing assets (have a file extension) or /api/* paths get a 404. Per-route <head>
  // is injected so each deep route gets its own title + self-referential canonical.
  app.notFound((c) => {
    const pathname = new URL(c.req.url).pathname;
    const isAsset = /\.[a-zA-Z0-9]+$/.test(pathname); // .js .css .png .ico .xml ...
    if (pathname.startsWith("/api") || isAsset) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(injectRouteMeta(content, pathname));
  });
}

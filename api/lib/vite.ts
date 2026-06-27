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
const ROUTE_META: Record<string, { title: string; desc?: string }> = {
  "/catalog": {
    title: "Kataloq | Xurcun — Quru meyvə, çərəz & hədiyyə",
    desc: "Xurcun kataloqu — quru meyvə, qoz-fındıq, çərəz, lokum, şokolad və hədiyyə qutuları. Bəyəndiyinizi seçin, WhatsApp ilə sifariş edin.",
  },
  "/menu": {
    title: "Menyu | Xurcun — Quru meyvə, çərəz və hədiyyə",
    desc: "Xurcun QR menyusu — quru meyvə, qoz-fındıq, çərəz, lokum, şirniyyat və hədiyyə çeşidləri. Telefondan baxın, WhatsApp ilə sifariş edin.",
  },
  "/privacy": { title: "Məxfilik Siyasəti | Xurcun" },
  "/cookie-policy": { title: "Cookie Siyasəti | Xurcun" },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Rewrite title + canonical + og:url/title/description for a deep route. Unknown routes
// (no override and not /menu/<slug>) keep the homepage meta — harmless, since they
// render the homepage via the SPA "*" fallback anyway.
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

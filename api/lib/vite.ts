import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  app.use("*", serveStatic({ root: "./dist/public" }));

  // SPA fallback. Serve index.html for any client route (BrowserRouter paths like
  // /catalog, /menu, /reservation) so crawlers and deep-links get 200 — NOT gated on
  // the Accept header (that previously returned 404 to Googlebot → pages unindexable).
  // Only real missing assets (have a file extension) or /api/* paths get a 404.
  app.notFound((c) => {
    const pathname = new URL(c.req.url).pathname;
    const isAsset = /\.[a-zA-Z0-9]+$/.test(pathname); // .js .css .png .ico .xml ...
    if (pathname.startsWith("/api") || isAsset) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}

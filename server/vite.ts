import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { isKnownPublicPath } from "@shared/public-routes";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve prerendered <route>/index.html directly (no trailing-slash redirect)
  // by rewriting /foo -> /foo/index.html when that file exists on disk.
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.endsWith("/") || path.extname(req.path)) return next();
    const candidate = path.join(distPath, req.path, "index.html");
    fs.stat(candidate, (err, stat) => {
      if (err || !stat.isFile()) return next();
      res.sendFile(candidate);
    });
  });

  app.use(
    express.static(distPath, {
      index: "index.html",
      extensions: ["html"],
      redirect: false,
    }),
  );

  const shellPath = path.resolve(distPath, "index.html");

  // dist/public/index.html is the PRERENDERED HOMEPAGE, not a blank shell — it
  // carries the homepage <title>, its canonical, and its og:url. Serving it
  // verbatim on a 404 advertises a dead URL as a duplicate of "/", which is a
  // soft-404 signal even though the status code is right. So we derive a
  // dedicated 404 shell once at boot: drop the homepage's canonical/og:url and
  // stamp a noindex + a truthful title. React then hydrates the not-found page
  // over the top, and crawlers that don't execute JS still see the truth.
  const notFoundShell = (() => {
    try {
      return fs
        .readFileSync(shellPath, "utf8")
        .replace(/<link[^>]+rel="canonical"[^>]*>/gi, "")
        .replace(/<meta[^>]+property="og:url"[^>]*>/gi, "")
        .replace(/<title>[^<]*<\/title>/i, "<title>Page Not Found | AffordEgypt</title>")
        .replace(/<head>/i, '<head>\n    <meta name="robots" content="noindex, nofollow" />');
    } catch {
      return null;
    }
  })();

  // SPA fallback for routes without a prerendered file. Unknown paths get
  // the SPA shell too (the client renders the not-found page) but with a
  // real 404 status — a 200 here is a soft-404 that keeps dead URLs (and
  // missing assets like a bad og:image path) alive in search indexes.
  app.use("*", (req, res) => {
    if (isKnownPublicPath(req.originalUrl)) {
      return res.status(200).sendFile(shellPath);
    }
    if (notFoundShell) {
      return res
        .status(404)
        .set({ "Content-Type": "text/html; charset=utf-8" })
        .send(notFoundShell);
    }
    return res.status(404).sendFile(shellPath);
  });
}

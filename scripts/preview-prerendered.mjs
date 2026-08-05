// Serve dist/public the way production does, so the prerendered HTML can be
// checked locally before it ships.
//
// `vite preview` is not a stand-in: it falls back to the SPA shell for /about,
// so the browser hydrates the *homepage* HTML and client-renders About over it.
// That hides prerender bugs locally and shows them only in production — which
// is how a page full of React #418 hydration mismatches got to the live site.
//
// This mirrors serveStatic() in server/vite.ts: /foo is rewritten to
// /foo/index.html when that file exists, and anything else gets the shell.
//
//   node scripts/preview-prerendered.mjs [port]

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distPath = path.join(root, "dist/public");
const port = Number(process.argv[2] ?? 4174);

if (!fs.existsSync(distPath)) {
  console.error(`No build at ${distPath} — run \`npx vite build\` first.`);
  process.exit(1);
}

const app = express();

// Prerendered route: /about -> /about/index.html (no trailing-slash redirect).
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  const candidate = path.join(distPath, req.path, "index.html");
  if (candidate.startsWith(distPath) && fs.existsSync(candidate)) {
    return res.sendFile(candidate);
  }
  next();
});

app.use(express.static(distPath, { index: "index.html", redirect: false }));

// SPA fallback, with the 404 status production returns for unknown paths.
app.use("*", (_req, res) =>
  res.status(404).sendFile(path.join(distPath, "index.html")),
);

app.listen(port, () => {
  console.log(`prerendered preview: http://localhost:${port}`);
});

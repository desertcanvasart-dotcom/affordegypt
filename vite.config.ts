import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import prerender from "@prerenderer/rollup-plugin";

// TODO: extend to multilingual locales by deriving routes from slugTranslation.ts source-of-truth.
// TODO: /routes and /reviews currently prerender thin (no API data baked in). Revisit with build-time API capture if these routes pull meaningful organic traffic. See Phase 1 docs.
const PRERENDER_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/transfers",
  "/destinations",
  "/attractions",
  "/routes",
  "/pricing-tool",
  "/budget-travel-egypt",
  "/egyptian-street-food-guide",
  "/nile-valley-guide",
  "/sinai-peninsula-guide",
  "/eastern-western-deserts-guide",
  "/cuisine-passport",
  "/travel-tips",
  "/cairo-airport-transfers",
  "/luxor-airport-transfers",
  "/aswan-airport-transfers",
  "/cairo-car-tour-guide-services",
  "/luxor-car-tour-guide-services",
  "/aswan-car-tour-guide-services",
  "/booking-agreement",
  "/terms-of-service",
  "/privacy-policy",
  "/cookie-policy",
  "/reviews",
  "/submit-review",
];

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
    prerender({
      routes: PRERENDER_ROUTES,
      renderer: "@prerenderer/renderer-puppeteer",
      rendererOptions: {
        renderAfterDocumentEvent: "prerender-ready",
        timeout: 30000,
        skipThirdPartyRequests: true,
        headless: true,
        maxConcurrentRoutes: 4,
        inject: { isPrerender: true },
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        },
      },
      postProcess(renderedRoute) {
        // Normalize inline style attributes from the browser's whitespaced/
        // trailing-semicolon serialization to React's compact form, so
        // hydration string comparison succeeds. Browser emits:
        //   style="background-size: cover; background-position: center;"
        // React emits:
        //   style="background-size:cover;background-position:center"
        renderedRoute.html = renderedRoute.html.replace(
          /style="([^"]*)"/g,
          (_match, css: string) => {
            const compact = css
              .replace(/:\s+/g, ":")
              .replace(/;\s+/g, ";")
              .replace(/;$/, "");
            return `style="${compact}"`;
          },
        );
        renderedRoute.html = renderedRoute.html.replace(
          /<head>/,
          `<head>\n    <meta name="prerender-status" content="prerendered" />`,
        );
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: true,
  },
});

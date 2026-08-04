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
    ...(process.env.SKIP_PRERENDER === "1"
      ? []
      : [
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
        ]),
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
    // Two chunks legitimately exceed Rollup's 500 kB default and can't
    // shrink further: the entry (~550 kB min / 123 kB gzip — every
    // prerendered public page must be statically imported, because
    // "prerender-ready" fires on first paint and a lazy page would be
    // captured as its loading fallback) and the pdf chunk (~730 kB,
    // loaded only by the lazy booking-confirmation page). 750 keeps the
    // build quiet for those while still flagging any new oversized chunk.
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        // Split stable vendor code out of the app chunk so page edits don't
        // re-download the framework, and the entry chunk stays well under
        // the 500 kB warning. App code (incl. lazy admin/auth pages) is
        // chunked by Rollup's defaults.
        manualChunks(id: string) {
          // Shared helper virtuals must live in the base chunk. Left
          // unassigned they land in whatever chunk Rollup meets first (the
          // pdf chunk here), and every chunk that needs the helper then
          // statically imports pdf — either dragging ~700 kB into the eager
          // graph (preload helper) or creating a react → pdf → vendor →
          // react cycle that evaluates vendor before React exists and
          // silently blanks the app (CJS interop helper). ONLY these exact
          // helpers — other \0 virtuals (per-module CJS proxies) must stay
          // with the module they belong to.
          if (id.includes("commonjsHelpers") || id.includes("vite/preload-helper") || id.includes("vite/modulepreload-polyfill")) return "react";
          if (!id.includes("node_modules")) {
            // The four locale JSONs are ~300 kB of source that every page
            // pays for but only the language switcher needs at once.
            if (id.includes("/i18n/locales/")) return "locales";
            return undefined;
          }
          // Only packages with zero runtime deps may share the react chunk —
          // anything that imports from another vendor package (e.g. wouter)
          // would create a react↔vendor cycle, and the half-initialized
          // chunk silently renders a blank page.
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          // PDF stack — only the lazy booking-confirmation page imports it,
          // so its own chunk keeps ~1 MB out of the eager vendor graph.
          if (/node_modules\/(jspdf|html2canvas|canvg|fflate|dompurify|core-js|stackblur-canvas|svg-pathdata|rgbcolor|raf|performance-now)\//.test(id)) return "pdf";
          if (id.includes("node_modules/@radix-ui/")) return "radix";
          if (/node_modules\/(lucide-react|react-icons)\//.test(id)) return "icons";
          if (/node_modules\/(i18next|react-i18next|i18next-browser-languagedetector)\//.test(id)) return "i18n";
          return "vendor";
        },
      },
    },
  },
});

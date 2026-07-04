import path from "path";
import { defineConfig } from "vitest/config";

// Mirrors the aliases in vite.config.ts / tsconfig.json paths so server
// and shared modules resolve identically under test. Tests are excluded
// from `npm run check` (tsconfig excludes **/*.test.ts); vitest owns them.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  test: {
    include: ["server/**/*.test.ts", "shared/**/*.test.ts", "client/src/**/*.test.ts"],
    environment: "node",
  },
});

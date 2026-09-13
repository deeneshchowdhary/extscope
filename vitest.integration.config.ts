import { defineConfig } from "vitest/config";

/**
 * Separate from vitest.config.ts because these tests load the real built
 * extension (dist/) into real Chromium via Playwright — they need `npm run
 * build` and `npx playwright install chromium` first, and are too slow to
 * run on every `npm test`.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});

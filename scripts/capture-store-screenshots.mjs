// Captures real screenshots of the actual built extension (dist/) running in
// real Chromium, alongside a set of small fixture extensions chosen to show
// every exposure level. Used for the Chrome Web Store listing — these are
// real product screenshots, not mockups. Requires `npm run build` and
// `npx playwright install chromium` first.
import { chromium } from "playwright";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = join(projectRoot, "dist");
const DEMO_DIR = join(projectRoot, "tests/fixtures/screenshot-demo");
const OUT_DIR = join(projectRoot, "docs/store-assets");
mkdirSync(OUT_DIR, { recursive: true });

const demoExtensionPaths = [
  "tab-counter",
  "chatgpt-helper",
  "claude-companion",
  "multi-ai-notes",
  "universal-enhancer",
].map((name) => join(DEMO_DIR, name));

const allExtensionPaths = [DIST_DIR, ...demoExtensionPaths].join(",");
const userDataDir = mkdtempSync(join(tmpdir(), "aief-screenshots-"));

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: false,
  viewport: { width: 1280, height: 800 },
  args: [
    "--headless=new",
    `--disable-extensions-except=${allExtensionPaths}`,
    `--load-extension=${allExtensionPaths}`,
    "--no-sandbox",
    "--window-size=1280,800",
  ],
});

let serviceWorker = context.serviceWorkers()[0];
if (!serviceWorker) serviceWorker = await context.waitForEvent("serviceworker", { timeout: 15000 });
const extensionId = serviceWorker.url().split("/")[2];
console.log("Extension ID:", extensionId);

await new Promise((resolve) => setTimeout(resolve, 1000));
const onboardingPage = context.pages().find((p) => p.url().includes("onboarding"));
if (onboardingPage) {
  await onboardingPage.click("button:has-text('Continue to dashboard')");
}
const page = onboardingPage ?? (await context.newPage());
if (!onboardingPage) {
  await page.goto(`chrome-extension://${extensionId}/dashboard.html`, { waitUntil: "networkidle" });
}
await page.setViewportSize({ width: 1280, height: 800 });
await page.waitForTimeout(800);

// Screenshot 1: main dashboard overview (full page, so all 5 demo extensions are visible)
await page.screenshot({ path: join(OUT_DIR, "screenshot-1-dashboard.png"), fullPage: true });
console.log("Saved screenshot-1-dashboard.png");

// Screenshot 2: an expanded finding, showing evidence-based explanations —
// cropped to just that card so the detail is readable at listing thumbnail size.
const extensiveCard = page.locator(".extension-card", { hasText: "Universal Page Enhancer" });
await extensiveCard.locator("button:has-text('View details')").click();
await page.waitForTimeout(400);
await extensiveCard.scrollIntoViewIfNeeded();
await extensiveCard.screenshot({ path: join(OUT_DIR, "screenshot-2-findings.png") });
console.log("Saved screenshot-2-findings.png");
await extensiveCard.locator("button:has-text('Hide details')").click();
await page.waitForTimeout(300);

// Screenshot 3: filtered by exposure level, showing the filter UI in use.
// Clipped to actual content height (not the full 800px viewport) so the
// screenshot isn't mostly dead whitespace below the one matching result.
await page.evaluate(() => window.scrollTo(0, 0));
const exposureLevelSelect = page.locator(".filter-bar label", { hasText: "Exposure level" }).locator("select");
await exposureLevelSelect.selectOption({ label: "Broad" });
await page.waitForTimeout(300);
const contentHeight = await page.evaluate(() => Math.ceil(document.body.getBoundingClientRect().height));
await page.screenshot({
  path: join(OUT_DIR, "screenshot-3-filtered.png"),
  clip: { x: 0, y: 0, width: 1280, height: Math.min(contentHeight + 24, 800) },
});
console.log("Saved screenshot-3-filtered.png");

// Screenshot 4: popup — screenshot just the #root element so it matches the
// real toolbar popup's auto-sized bubble instead of a fixed tab viewport.
const popupPage = await context.newPage();
await popupPage.setViewportSize({ width: 360, height: 600 });
await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, { waitUntil: "networkidle" });
await popupPage.waitForTimeout(500);
await popupPage.locator("#root").screenshot({ path: join(OUT_DIR, "screenshot-4-popup.png") });
console.log("Saved screenshot-4-popup.png");

await context.close();
rmSync(userDataDir, { recursive: true, force: true });
console.log("Done. Screenshots in docs/store-assets/");

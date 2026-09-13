import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type BrowserContext, type Page } from "playwright";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

/**
 * Loads the actual packaged extension (dist/, produced by `npm run build`)
 * into a real Chromium instance alongside a minimal dummy fixture extension,
 * and drives it exactly as a user would. This exists because the dev-mode
 * chrome.* mock (src/dev/chrome-mock.ts) cannot exercise real extension
 * lifecycle events — chrome.runtime.onInstalled opening the onboarding tab,
 * chrome.management.setEnabled, or real network-request isolation — and a
 * real bug (onboarding completing into a permanently empty dashboard) only
 * surfaced under this real-browser path.
 */

const DIST_DIR = join(projectRoot, "dist");
const DUMMY_EXTENSION_DIR = join(projectRoot, "tests/fixtures/dummy-chrome-extension");

describe.skipIf(!existsSync(DIST_DIR))("packaged extension in real Chromium", () => {
  let context: BrowserContext;
  let extensionId: string;
  let userDataDir: string;

  beforeAll(async () => {
    userDataDir = mkdtempSync(join(tmpdir(), "aief-integration-"));
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        "--headless=new",
        `--disable-extensions-except=${DIST_DIR},${DUMMY_EXTENSION_DIR}`,
        `--load-extension=${DIST_DIR},${DUMMY_EXTENSION_DIR}`,
        "--no-sandbox",
      ],
    });

    let serviceWorker = context.serviceWorkers()[0];
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker", { timeout: 15000 });
    }
    extensionId = serviceWorker.url().split("/")[2];
  }, 30000);

  afterAll(async () => {
    await context?.close();
    if (userDataDir) rmSync(userDataDir, { recursive: true, force: true });
  });

  function findPage(urlFragment: string): Page {
    const page = context.pages().find((p) => p.url().includes(urlFragment));
    if (!page) throw new Error(`No open page matching "${urlFragment}". Open: ${context.pages().map((p) => p.url())}`);
    return page;
  }

  it("auto-opens an onboarding tab on fresh install", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const onboardingPage = context.pages().find((p) => p.url().includes("onboarding"));
    expect(onboardingPage).toBeTruthy();
  });

  it("completing onboarding loads a real scan instead of staying empty", async () => {
    const onboardingPage = findPage("onboarding");
    await onboardingPage.click("button:has-text('Continue to dashboard')");
    await onboardingPage.waitForTimeout(800);
    const text = await onboardingPage.innerText("body");
    expect(text).toContain("1 extensions analyzed");
  });

  it("classifies the dummy fixture as Broad exposure with evidence-backed findings, no console errors", async () => {
    const page = findPage("dashboard");
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    const summaryText = await page.innerText("body");
    expect(summaryText).toContain("Dummy AI Reader");
    expect(summaryText).toContain("Broad");

    await page.click("button:has-text('View details')");
    await page.waitForTimeout(300);
    const detailText = await page.innerText("body");
    expect(detailText).toContain("chatgpt.com");
    expect(detailText).toContain("claude.ai");

    expect(errors).toEqual([]);
  });

  it("has a heading hierarchy with no level skips (h1 -> h2 -> h3)", async () => {
    const page = findPage("dashboard");
    const headingLevels = await page.evaluate(() =>
      Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => Number(h.tagName[1]))
    );
    expect(headingLevels[0]).toBe(1);
    for (let i = 1; i < headingLevels.length; i++) {
      expect(headingLevels[i] - headingLevels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  it("is fully keyboard operable: Tab reaches 'View details' and Enter toggles it", async () => {
    const page = findPage("dashboard");
    // Reload for a deterministic starting DOM: an earlier test expands the
    // details panel, which would otherwise leave this button reading "Hide
    // details" and shift the count of focusable elements ahead of it.
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.locator("body").focus();
    for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
    const focusedText = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedText).toContain("View details");

    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    const toggled = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("details"));
      return { text: btn?.textContent, ariaExpanded: btn?.getAttribute("aria-expanded") };
    });
    expect(toggled.text).toContain("Hide details");
    expect(toggled.ariaExpanded).toBe("true");
  });

  it("disabling an extension from the dashboard calls the real chrome.management API", async () => {
    const page = findPage("dashboard");
    await page.click("button:has-text('Disable')");
    await page.waitForTimeout(800);
    const text = await page.innerText("body");
    expect(text).toContain("Enable");
    expect(text).toContain("Disabled");
  });

  it("makes no network requests outside its own extension origin", async () => {
    const page = findPage("dashboard");
    const requests: string[] = [];
    page.on("request", (req) => requests.push(req.url()));
    await page.reload({ waitUntil: "networkidle" });
    expect(requests.length).toBeGreaterThan(0);
    expect(requests.every((url) => url.startsWith(`chrome-extension://${extensionId}/`))).toBe(true);
  });

  it("the Delete all stored data flow clears then re-populates the dashboard", async () => {
    const page = findPage("dashboard");
    await page.click("button:has-text('Settings')");
    await page.waitForTimeout(300);
    page.once("dialog", (dialog) => dialog.accept());
    await page.click("button:has-text('Delete all stored data')");
    await page.waitForTimeout(1000);
    const text = await page.innerText("body");
    expect(text).toContain("1 extensions analyzed");
  });
});

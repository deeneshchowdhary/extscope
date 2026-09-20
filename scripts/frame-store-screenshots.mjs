// Pads the raw captures in docs/store-assets/ onto 1280x800 canvases, the size the
// Chrome Web Store accepts, writing the upload-ready files to docs/store-assets/upload/.
// Run after capture-store-screenshots.mjs.
import { chromium } from "playwright";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, "docs/store-assets");
const outDir = join(srcDir, "upload");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
for (const name of readdirSync(srcDir).filter((f) => f.endsWith(".png"))) {
  const b64 = readFileSync(join(srcDir, name)).toString("base64");
  await page.setContent(
    `<body style="margin:0;width:1280px;height:800px;background:#eef1f6;display:flex;align-items:center;justify-content:center">
       <img src="data:image/png;base64,${b64}" style="max-width:1200px;max-height:740px;box-shadow:0 4px 24px rgba(0,0,0,.18);border-radius:8px">
     </body>`,
  );
  // JPEG: the store rejects PNGs with an alpha channel, and Chromium's PNGs always have one.
  await page.screenshot({ path: join(outDir, name.replace(".png", ".jpg")), type: "jpeg", quality: 95 });
  console.log("Wrote upload/" + name.replace(".png", ".jpg"));
}
await browser.close();

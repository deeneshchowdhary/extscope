// Renders the Chrome Web Store promo tiles (small 440x280, marquee 1400x560) as JPEGs
// (no alpha, as the store requires) into docs/store-assets/upload/.
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "docs/store-assets/upload");
mkdirSync(outDir, { recursive: true });
const icon = readFileSync(join(root, "public/icons/icon-128.png")).toString("base64");

const tile = (w, h, scale) => `
<body style="margin:0;width:${w}px;height:${h}px;box-sizing:border-box;padding:0 ${60 * scale}px;display:flex;align-items:center;gap:${36 * scale}px;
  background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif">
  <img src="data:image/png;base64,${icon}" style="width:${110 * scale}px;height:${110 * scale}px;border-radius:${24 * scale}px">
  <div>
    <div style="font-size:${52 * scale}px;font-weight:700;letter-spacing:-1px">ExtScope</div>
    <div style="font-size:${24 * scale}px;line-height:1.3;margin-top:${10 * scale}px;color:#cbd5e1">Which extensions can<br>see your AI chats?</div>
    <div style="font-size:${15 * scale}px;margin-top:${16 * scale}px;color:#93c5fd">Local · Private · Open source</div>
  </div>
</body>`;

const browser = await chromium.launch();
for (const [name, w, h, scale] of [
  ["promo-small-440x280.jpg", 440, 280, 0.62],
  ["promo-marquee-1400x560.jpg", 1400, 560, 1.4],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(tile(w, h, scale));
  await page.screenshot({ path: join(outDir, name), type: "jpeg", quality: 95 });
  console.log("Wrote upload/" + name);
}
await browser.close();

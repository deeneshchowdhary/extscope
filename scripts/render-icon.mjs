// Rasterizes design/icon.svg to crisp PNGs at every size Chrome needs, using
// real Chromium (already a dev dependency for integration testing) rather
// than a raw pixel-pushing generator — proper anti-aliased vector output.
import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const svgFull = readFileSync(join(projectRoot, "design/icon.svg"), "utf-8");
const svgSmall = readFileSync(join(projectRoot, "design/icon-small.svg"), "utf-8");
const outDir = join(projectRoot, "public/icons");
mkdirSync(outDir, { recursive: true });

// The full eye motif doesn't survive down to toolbar sizes (tested: it
// blurs into a smudge at 16px), so 16/32 use a simplified shield+dot mark
// and 48/128 use the full shield+eye design. Standard icon-set practice.
const renders = [
  { size: 16, svg: svgSmall },
  { size: 32, svg: svgSmall },
  { size: 48, svg: svgFull },
  { size: 128, svg: svgFull },
];

const browser = await chromium.launch({ args: ["--headless=new", "--no-sandbox"] });
for (const { size, svg } of renders) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><html><head><style>html,body{margin:0;padding:0;}svg{display:block;width:${size}px;height:${size}px;}</style></head><body>${svg}</body></html>`
  );
  const buffer = await page.screenshot({ omitBackground: true });
  writeFileSync(join(outDir, `icon-${size}.png`), buffer);
  console.log(`wrote icon-${size}.png`);
  await page.close();
}

// Also render large previews of both variants for design review (not shipped).
for (const [name, svg] of [["full", svgFull], ["small", svgSmall]]) {
  const previewPage = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await previewPage.setContent(
    `<!doctype html><html><head><style>html,body{margin:0;padding:0;}svg{display:block;width:512px;height:512px;}</style></head><body>${svg}</body></html>`
  );
  writeFileSync(join(projectRoot, `design/icon-preview-${name}-512.png`), await previewPage.screenshot());
  console.log(`wrote design/icon-preview-${name}-512.png`);
}

await browser.close();

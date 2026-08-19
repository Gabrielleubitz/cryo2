// Captures the hero across frost states: frozen, mid intro-wipe, wiped, mobile.
// Usage: node scripts/shoot-hero.mjs [url] [outDir]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000/";
const outDir = process.argv[3] ?? "/tmp/hero";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const errors = [];

const shoot = async (page, name) =>
  page.screenshot({ path: `${outDir}/${name}.png` });

// --- desktop --------------------------------------------------------------
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`CONSOLE ${m.text()}`));

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(300);
await shoot(page, "1-frozen");

await page.waitForTimeout(1400);
await shoot(page, "2-intro");

await page.waitForTimeout(1200);
await shoot(page, "3-settled");

// Drag a pointer across the frosted side (left, where the chamber is).
for (let i = 0; i <= 34; i++) {
  await page.mouse.move(110 + i * 17, 640 - Math.sin((i / 34) * Math.PI) * 300);
  await page.waitForTimeout(16);
}
await page.waitForTimeout(120);
await shoot(page, "4-wiped");

// --- reduced motion -------------------------------------------------------
const rm = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
await rm.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await rm.waitForTimeout(800);
await shoot(rm, "5-reduced-motion");
console.log(
  "reduced motion canvases in hero:",
  await rm.locator("section canvas").count()
);

// --- mobile ---------------------------------------------------------------
const m = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
await m.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await m.waitForTimeout(2600);
await shoot(m, "6-mobile");

await browser.close();
console.log(errors.length ? [...new Set(errors)].slice(0, 10) : "no console errors");

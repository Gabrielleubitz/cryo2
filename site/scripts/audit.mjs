// Checks the reduced-motion fallback and measures transferred bytes.
// Usage: node scripts/audit.mjs [url]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3001/";
const OUT = "/tmp/audit";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

/* ---------------- reduced motion ---------------- */
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const h = await page.evaluate(() => document.body.scrollHeight);
  const canvases = await page.locator("canvas").count();
  console.log(`reduced-motion: height ${h}px, ${canvases} canvas element(s)`);

  // every section must still be reachable and readable
  for (const t of ["session-title", "machine-title"]) {
    const vis = await page.locator(`#${t}`).isVisible();
    console.log(`  #${t} visible: ${vis}`);
  }
  await page.screenshot({ path: `${OUT}/reduced-top.png` });
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/reduced-machine.png` });
  await page.evaluate(() => window.scrollTo(0, 3400));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/reduced-session.png` });
  if (errs.length) console.log("  errors:", errs.slice(0, 5));
  await page.close();
}

/* ---------------- transfer weight ---------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const byType = {};
  let total = 0;
  page.on("response", async (r) => {
    try {
      const len = Number(r.headers()["content-length"] ?? 0);
      if (!len) return;
      const ct = (r.headers()["content-type"] ?? "other").split(";")[0];
      byType[ct] = (byType[ct] ?? 0) + len;
      total += len;
    } catch {}
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  console.log(`\ninitial load (no scroll): ${(total / 1048576).toFixed(2)} MB`);

  const before = total;
  // scroll through the whole page to trigger sequence + lazy assets
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 45));
    }
  });
  await page.waitForTimeout(4000);
  console.log(`after full scroll:       ${(total / 1048576).toFixed(2)} MB  (+${((total - before) / 1048576).toFixed(2)} MB)`);
  console.log("\nby content-type:");
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([k, v]) => console.log(`  ${(v / 1024).toFixed(0).padStart(7)} KB  ${k}`));
  await page.close();
}

await browser.close();

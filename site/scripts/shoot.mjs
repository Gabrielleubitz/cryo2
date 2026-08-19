// Screenshots the page at a set of scroll depths.
// Usage: node scripts/shoot.mjs [url] [outDir] [--mobile] [--full]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://localhost:3000/";
const outDir = process.argv[3] ?? "/tmp/shots";
const mobile = process.argv.includes("--mobile");
const full = process.argv.includes("--full");

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const errors = [];
page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`CONSOLE ${m.text()}`);
});
page.on("requestfailed", (r) =>
  errors.push(`REQFAIL ${r.url().slice(0, 120)} ${r.failure()?.errorText}`)
);

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500); // let frame preload settle

const height = await page.evaluate(() => document.body.scrollHeight);
const vh = page.viewportSize().height;
console.log(`page height: ${height}px (${(height / vh).toFixed(1)} screens)`);

if (full) {
  await page.screenshot({ path: `${outDir}/full.png`, fullPage: true });
} else {
  const stops = Number(process.env.STOPS ?? 14);
  for (let i = 0; i < stops; i++) {
    const y = Math.round((height - vh) * (i / (stops - 1)));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(900); // let lerp + transitions settle
    await page.screenshot({
      path: `${outDir}/${String(i).padStart(2, "0")}.png`,
    });
  }
}

await browser.close();

if (errors.length) {
  console.log("\n--- ISSUES ---");
  [...new Set(errors)].slice(0, 25).forEach((e) => console.log(e));
} else {
  console.log("\nno console/network errors");
}

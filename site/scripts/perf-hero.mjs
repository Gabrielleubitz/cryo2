// Reports main-thread long tasks during hero load. The frost texture is baked
// once on mount at full DPR, so this is the thing most likely to jank.
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000/";
// `--reduced` disables every animated layer, giving a floor to compare against.
const reduced = process.argv.includes("--reduced");
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  ...(reduced ? { reducedMotion: "reduce" } : {}),
});

await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries())
      window.__long.push({ t: Math.round(e.startTime), d: Math.round(e.duration) });
  }).observe({ entryTypes: ["longtask"] });
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
// Long enough to outlast the frost refreeze window and observe a truly idle hero.
await page.waitForTimeout(16000);

const entries = await page.evaluate(() => window.__long);
const lcp = await page.evaluate(
  () =>
    new Promise((res) => {
      new PerformanceObserver((l) => {
        const e = l.getEntries().at(-1);
        res(e ? Math.round(e.startTime) : null);
      }).observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => res(null), 1500);
    })
);

// Bucket by second so a busy startup is distinguishable from a busy idle.
const buckets = new Map();
for (const { t, d } of entries) {
  const s = Math.floor(t / 2000) * 2;
  const b = buckets.get(s) ?? { n: 0, max: 0 };
  b.n += 1;
  b.max = Math.max(b.max, d);
  buckets.set(s, b);
}
console.log("long tasks by 2s window (count / longest ms):");
for (let s = 0; s <= 16; s += 2) {
  const b = buckets.get(s);
  console.log(`  ${String(s).padStart(2)}-${s + 2}s  ${b ? `${b.n} / ${b.max}ms` : "—"}`);
}
console.log("total:", entries.length, "| LCP:", lcp, "ms");
await browser.close();

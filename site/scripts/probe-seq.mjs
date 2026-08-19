// Counts how many times each frame of the session sequence is requested while
// scrolling through the page. A healthy run fetches each frame exactly once.
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const hits = new Map();
page.on("request", (r) => {
  const u = r.url();
  if (u.includes("/seq/session/")) hits.set(u, (hits.get(u) ?? 0) + 1);
});

await page.goto(url, { waitUntil: "load" });
for (let i = 0; i < 26; i++) {
  await page.mouse.wheel(0, 250);
  await page.waitForTimeout(130);
}
await page.waitForTimeout(2500);

const counts = [...hits.values()];
console.log(
  JSON.stringify(
    {
      totalRequests: counts.reduce((a, b) => a + b, 0),
      uniqueFrames: hits.size,
      refetched: counts.filter((n) => n > 1).length,
      worstSingleFrame: counts.length ? Math.max(...counts) : 0,
    },
    null,
    2
  )
);
await browser.close();

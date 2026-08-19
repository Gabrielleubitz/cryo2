// Captures the chamber section at points through its scroll, so the callout
// sequence can be checked as a sequence.
//
// The section is 420vh of sticky scroll, so ordinary full-page screenshots step
// straight past the middle of it and only ever show the first callout. What
// needs checking is that each marker lights on the part it names, the spotlight
// follows it, and the rail agrees with the copy.
//
// Usage: node scripts/shoot-chamber.mjs http://localhost:4361/ out/dir [--mobile]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3000/";
const out = process.argv[3] ?? "shots/chamber";
const mobile = process.argv.includes("--mobile");

const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const STOPS = [0, 0.18, 0.42, 0.55, 0.72, 0.95];

mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });

const box = await page.evaluate(() => {
  const el = document.querySelector("#chamber");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: r.height };
});
if (!box) throw new Error("#chamber not found");

for (const f of STOPS) {
  // Progress runs from the section's top hitting the viewport top to its bottom
  // leaving it, which is height minus one viewport of scroll.
  const y = box.top + f * (box.height - viewport.height);
  await page.evaluate((to) => window.scrollTo({ top: to, behavior: "instant" }), y);
  // Long enough for the eased spotlight and the 500ms copy transition to land.
  await page.waitForTimeout(1400);

  const label = String(Math.round(f * 100)).padStart(2, "0");
  await page.screenshot({ path: `${out}/p${label}.png` });

  const state = await page.evaluate(() => {
    const rail = [...document.querySelectorAll("#chamber .origin-left")].map((el) => {
      const m = getComputedStyle(el).transform;
      return m === "none" ? 1 : Number(m.split("(")[1].split(",")[0]).toFixed(2);
    });
    const copy = [...document.querySelectorAll("#chamber h3")]
      .filter((el) => Number(getComputedStyle(el.parentElement).opacity) > 0.5)
      .map((el) => el.textContent);
    return { rail, copy };
  });
  console.log(`${label}%  rail ${state.rail.join(" ")}  showing "${state.copy.join(", ")}"`);
}

await browser.close();
console.log(`\n${STOPS.length} frames -> ${out}`);

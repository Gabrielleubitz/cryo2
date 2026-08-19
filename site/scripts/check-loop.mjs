// Asserts a looping video contains no hard cut and wraps cleanly.
//
// The hero window originally started 0.23s before a shot boundary, so seven
// frames of the previous shot were baked into the loop and it hard-cut twice
// per cycle. That is invisible in a still and obvious in motion, so it needs a
// check rather than an eyeball.
//
// Usage: node scripts/check-loop.mjs public/video/hero-loop.mp4
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const file = process.argv[2] ?? "public/video/hero-loop.mp4";
// A cut replaces the whole frame, so it needs an absolute floor as well as a
// ratio: this footage is nearly static (median diff ~0.06), so a pure ratio
// flags ordinary movement. For reference, the cut that prompted this measured
// 29.9 against a median of 0.061 — roughly 490x — while the largest genuine
// movement in the same clip is 0.93.
const CUT_RATIO = 25;
const CUT_ABS = 5;

const dir = mkdtempSync(join(tmpdir(), "loop-"));
try {
  execFileSync("ffmpeg", [
    "-v", "error", "-i", file,
    "-vf", "scale=160:-2", "-vsync", "0",
    join(dir, "%04d.png"),
  ]);

  const frames = [];
  for (const f of readdirSync(dir).sort()) {
    frames.push(await sharp(join(dir, f)).greyscale().raw().toBuffer());
  }

  const mad = (a, b) => {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
    return s / a.length;
  };

  const diffs = [];
  for (let i = 1; i < frames.length; i++) diffs.push(mad(frames[i - 1], frames[i]));
  const wrap = mad(frames.at(-1), frames[0]);
  const median = [...diffs].sort((a, b) => a - b)[Math.floor(diffs.length / 2)];
  const limit = Math.max(median * CUT_RATIO, CUT_ABS);

  const cuts = diffs
    .map((d, i) => ({ frame: i + 2, d }))
    .filter((x) => x.d > limit);

  console.log(`${file}: ${frames.length} frames`);
  console.log(`  median frame diff : ${median.toFixed(3)}`);
  console.log(`  max frame diff    : ${Math.max(...diffs).toFixed(3)}`);
  console.log(`  wrap (last→first) : ${wrap.toFixed(3)}`);
  console.log(`  cut threshold     : ${limit.toFixed(3)}`);

  const problems = [];
  if (cuts.length)
    problems.push(`hard cut at frame(s) ${cuts.map((c) => `${c.frame} (${c.d.toFixed(2)})`).join(", ")}`);
  if (wrap > limit) problems.push(`loop wrap jumps (${wrap.toFixed(2)} > ${limit.toFixed(2)})`);

  if (problems.length) {
    console.error("\nFAIL: " + problems.join("; "));
    process.exit(1);
  }
  console.log("\nOK: no cuts, wraps cleanly");
} finally {
  rmSync(dir, { recursive: true, force: true });
}

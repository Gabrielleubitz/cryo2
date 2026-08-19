// Generates web-ready AVIF/WebP images from assets-src/ into site/public/img/.
// Run: node scripts/build-images.mjs   (FORCE=1 to rebuild)
import sharp from "sharp";
import { mkdir, stat, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(SITE, "..");
const SRC = path.join(ROOT, "assets-src");
const OUT = path.join(SITE, "public/img");
const FORCE = process.env.FORCE === "1";

/** @type {{src:string,name:string,widths:number[],fit?:string,alpha?:boolean}[]} */
const JOBS = [
  // --- machines (transparent renders -> keep alpha, webp/png only) ---
  { src: "machines/sp11b-product.png", name: "cryoone", widths: [500, 1000], alpha: true },
  { src: "machines/sp4b-transparent.png", name: "cryoair-multi", widths: [600, 1200], alpha: true },
  // Cutout of the actual cryoair unit on the floor of the Dickson City suite.
  { src: "machines/layer-0-v1.png", name: "cryoair-unit", widths: [600, 1100], alpha: true },
  { src: "machines/sp13b-banner.jpg", name: "suite", widths: [1080] },
  { src: "machines/sp11b-3.jpg", name: "cryoone-room", widths: [800, 1600] },
  { src: "machines/antarctica-open-head.png", name: "localized-unit", widths: [400, 800], alpha: true },

  // --- chamber / facility ---
  { src: "chamber/wbc-bg-1.jpg", name: "chamber-wide", widths: [1200, 1920] },
  { src: "chamber/dickson-city.png", name: "chamber-real", widths: [768, 1400] },
  { src: "chamber/cryotherapy-1.jpg", name: "chamber-hero", widths: [1200, 1920] },
  { src: "chamber/wbc-0m17s.jpg", name: "chamber-mist", widths: [1200, 1920] },

  // --- team ---
  { src: "team/mike-and-mark.jpg", name: "owners", widths: [800, 1600] },

  // --- lifestyle ---
  // Note: lifestyle/athletes-recovery.jpg is a 29MB stock collage — unusable.
  { src: "lifestyle/woman-jogging.jpg", name: "jogging", widths: [700, 1400] },
  { src: "lifestyle/tying-shoes.jpg", name: "shoes", widths: [700] },
  { src: "lifestyle/pickleball.jpg", name: "pickleball", widths: [700, 1400] },
  { src: "lifestyle/group-fitness.jpg", name: "community", widths: [700] },
  { src: "lifestyle/local-community.jpg", name: "local", widths: [900, 1600] },
  { src: "lifestyle/istock-recovery.jpg", name: "recovery", widths: [900, 1600] },

  // --- brand ---
  { src: "brand/logo-white.png", name: "logo-white", widths: [660], alpha: true },
  { src: "brand/logo-black.png", name: "logo-black", widths: [660], alpha: true },
  { src: "brand/icon.png", name: "icon", widths: [250], alpha: true },
];

await mkdir(OUT, { recursive: true });

let made = 0,
  skipped = 0,
  bytes = 0;

for (const job of JOBS) {
  const input = path.join(SRC, job.src);
  if (!existsSync(input)) {
    console.warn(`MISSING  ${job.src}`);
    continue;
  }

  for (const w of job.widths) {
    const suffix = job.widths.length > 1 ? `-${w}` : "";
    const base = path.join(OUT, `${job.name}${suffix}`);

    // AVIF is skipped for alpha assets: the quality/size tradeoff on flat
    // product renders isn't worth the extra encode time.
    const formats = job.alpha ? ["webp"] : ["avif", "webp"];

    for (const fmt of formats) {
      const dest = `${base}.${fmt}`;
      if (existsSync(dest) && !FORCE) {
        skipped++;
        bytes += (await stat(dest)).size;
        continue;
      }
      let pipe = sharp(input).resize({ width: w, withoutEnlargement: true });
      pipe =
        fmt === "avif"
          ? pipe.avif({ quality: 52, effort: 5 })
          : pipe.webp({ quality: job.alpha ? 88 : 76, effort: 5 });
      await pipe.toFile(dest);
      bytes += (await stat(dest)).size;
      made++;
    }
  }
}

// Low-quality blur placeholders for the largest hero images.
const PLACEHOLDERS = ["chamber-hero-1920", "chamber-wide-1920", "owners-1600"];
const blurs = {};
for (const n of PLACEHOLDERS) {
  const f = path.join(OUT, `${n}.webp`);
  if (!existsSync(f)) continue;
  const buf = await sharp(f).resize({ width: 16 }).webp({ quality: 30 }).toBuffer();
  blurs[n] = `data:image/webp;base64,${buf.toString("base64")}`;
}
await sharp({ create: { width: 1, height: 1, channels: 3, background: "#0C061A" } })
  .png()
  .toFile(path.join(OUT, "pixel.png"));

const { writeFile } = await import("node:fs/promises");
await mkdir(path.join(SITE, "src/lib"), { recursive: true });
await writeFile(path.join(SITE, "src/lib/blur.json"), JSON.stringify(blurs, null, 2));

const files = await readdir(OUT);
console.log(
  `images: ${made} written, ${skipped} cached, ${files.length} files, ${(bytes / 1048576).toFixed(2)} MB total`
);

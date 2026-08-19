"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, mapRange, useSectionProgress, usePrefersReducedMotion } from "@/lib/scroll";

/**
 * Callouts pinned to the machine, revealed as the section scrolls.
 *
 * `x`/`y` are fractions of the drawn machine's own box, not the viewport, so a
 * marker stays on the part it names through the scroll-tied push-in.
 */
const HOTSPOTS = [
  {
    // Visible from the moment the section lands. At 0.16 the copy column sat
    // empty for the first sixth of the scroll, which read as a broken layout
    // rather than an intro.
    at: 0,
    // The shell itself, where the cooling hardware lives — and clear of the
    // MECOTEC wordmark printed across the top panel.
    x: 0.26,
    y: 0.4,
    title: "Fully electric",
    body: "No liquid nitrogen, ever. You breathe ordinary air for the whole session.",
  },
  {
    at: 0.4,
    // Mid-height inside the lit chamber, where you'd be standing.
    x: 0.62,
    y: 0.5,
    title: "Even head-to-toe cold",
    body: "Circulated dry air holds the same temperature at your shoulders and your ankles.",
  },
  {
    at: 0.64,
    // The threshold at the base of the doorway. This was on the outer side wall,
    // which named a floor while pointing at a panel.
    x: 0.62,
    y: 0.88,
    title: "Walk-in floor",
    body: "Step straight in at floor level. Nothing to climb, nothing to lower yourself into.",
  },
];

/** Where each callout's slice of the scroll ends, for the progress rail. */
const SPOT_END = HOTSPOTS.map((_, i) => HOTSPOTS[i + 1]?.at ?? 0.92);

const AMBIENT_F = 72;
const TARGET_F = -220;

type Mote = { x: number; y: number; r: number; vx: number; vy: number; life: number };

type Flake = {
  x: number;
  y: number;
  /** Depth, 0 = far haze, 1 = right in front of the lens. */
  z: number;
  vy: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  rot: number;
  spin: number;
  sprite: number;
  /** Point in the cold ramp where this flake starts falling. */
  gate: number;
};

/**
 * Bakes one six-armed dendrite into its own canvas.
 *
 * Snowflakes are stroked once at startup and then blitted with a transform;
 * re-stroking ~90 branching paths every frame would not hold 60fps.
 */
function makeFlakeSprite(size: number, rnd: () => number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;

  const arm = size * 0.4;
  const width = size * 0.03;
  const pairs = 2 + Math.floor(rnd() * 3);
  const spread = 0.85 + rnd() * 0.4;
  const reach = 0.24 + rnd() * 0.16;

  g.translate(size / 2, size / 2);
  g.strokeStyle = "#eef4ff";
  g.lineCap = "round";
  g.shadowColor = "rgba(190,214,255,0.9)";
  g.shadowBlur = size * 0.05;

  for (let i = 0; i < 6; i++) {
    g.save();
    g.rotate((Math.PI / 3) * i);

    g.lineWidth = width;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(0, -arm);
    g.stroke();

    for (let b = 1; b <= pairs; b++) {
      const f = b / (pairs + 1);
      const y = -arm * f;
      const len = arm * reach * (1 - f * 0.5);
      g.lineWidth = width * (1 - f * 0.3);
      for (const dir of [-1, 1]) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(dir * Math.sin(spread) * len, y - Math.cos(spread) * len);
        g.stroke();
      }
    }
    g.restore();
  }

  // Hexagonal nucleus.
  g.lineWidth = width * 0.9;
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const r = arm * 0.16;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.stroke();

  return c;
}

export default function MachineCanvas() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { progress, active, onScreen } = useSectionProgress(sectionRef);
  const reduced = usePrefersReducedMotion();

  const [temp, setTemp] = useState(AMBIENT_F);
  // Starts at 0, not -1: the first callout is pinned to progress 0, so -1 only
  // ever showed as a blank frame before the first tick.
  const [activeSpot, setActiveSpot] = useState(0);
  const [imgReady, setImgReady] = useState(false);

  const machine = useRef<HTMLImageElement | null>(null);
  const motes = useRef<Mote[]>([]);
  const flakes = useRef<Flake[]>([]);
  const sprites = useRef<HTMLCanvasElement[]>([]);

  // Markers and rail are DOM but driven from the animation loops by writing
  // styles through these refs, so tracking the machine costs no re-renders.
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dpr = useRef(1);
  /** Spotlight position, eased toward the active marker so it travels. */
  const glow = useRef<{ x: number; y: number } | null>(null);

  // ---- load the product render ---------------------------------------------
  useEffect(() => {
    const img = new Image();
    img.src = "/img/cryoone-1000.webp";
    img.onload = () => {
      machine.current = img;
      setImgReady(true);
    };
  }, []);

  // ---- seed snow + vapor ---------------------------------------------------
  useEffect(() => {
    // Deterministic PRNG so the snowfall is stable across resizes.
    let s = 20240817;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

    sprites.current = Array.from({ length: 5 }, () => makeFlakeSprite(128, rnd));

    flakes.current = Array.from({ length: 90 }, (_, i) => {
      const z = rnd();
      return {
        x: rnd(),
        y: rnd(),
        z,
        // Near flakes fall faster, which sells the depth more than size alone.
        vy: (0.0006 + rnd() * 0.0008) * (0.45 + z),
        swayAmp: 0.012 + rnd() * 0.04,
        swaySpeed: 0.25 + rnd() * 0.5,
        phase: rnd() * Math.PI * 2,
        rot: rnd() * Math.PI * 2,
        spin: (rnd() - 0.5) * 0.006,
        sprite: Math.floor(rnd() * 5),
        // Staggered so the snow builds up through the section instead of
        // switching on all at once.
        gate: i / 90,
      };
    });

    motes.current = Array.from({ length: 60 }, () => ({
      x: rnd(),
      y: 0.55 + rnd() * 0.5,
      r: 12 + rnd() * 60,
      vx: (rnd() - 0.5) * 0.0004,
      vy: -0.00008 - rnd() * 0.00022,
      life: rnd(),
    }));
  }, []);

  // ---- render loop ---------------------------------------------------------
  // Gated on `onScreen` rather than `active`: this paints three full-screen
  // gradients plus ~150 particles per frame, and the 20% lookahead margin was
  // enough to keep it running the whole time you sat on the hero.
  useEffect(() => {
    if (reduced || !onScreen) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(r.width * ratio);
      cv.height = Math.round(r.height * ratio);
      dpr.current = ratio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const time = (now - t0) / 1000;
      const p = clamp(progress.current ?? 0);
      const W = cv.width;
      const H = cv.height;
      if (!W || !H) return;

      ctx.clearRect(0, 0, W, H);

      const chill = mapRange(p, 0.05, 0.75, 0, 1); // master "how cold" driver

      // On wide screens the machine sits right of centre so the copy column on
      // the left stays clear. On phones it re-centres and shrinks into the band
      // between the heading and the callouts.
      const wide = W / H > 1.15;
      const cx = wide ? 0.66 : 0.5;
      const cy = wide ? 0.52 : 0.57;

      // --- cold bloom behind the machine ---
      const bloom = ctx.createRadialGradient(
        W * cx, H * cy, 0,
        W * cx, H * cy, Math.max(W, H) * 0.55
      );
      bloom.addColorStop(0, `rgba(37,25,231,${0.1 + chill * 0.42})`);
      bloom.addColorStop(0.55, `rgba(48,92,222,${0.05 + chill * 0.14})`);
      bloom.addColorStop(1, "rgba(11,7,20,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);

      // --- snowfall -------------------------------------------------------
      // Ramps in with the cold. Advanced once per frame here, then drawn in
      // two depth passes so flakes pass behind and in front of the chamber.
      const snow = mapRange(p, 0.12, 0.7, 0, 1);
      const unit = Math.min(W, H);

      for (const f of flakes.current) {
        if (snow < f.gate) continue;
        f.y += f.vy;
        f.rot += f.spin;
        if (f.y > 1.1) {
          f.y = -0.1;
          f.x = (f.x + 0.377) % 1; // re-enter somewhere new
        }
      }

      const drawSnow = (loZ: number, hiZ: number) => {
        const list = sprites.current;
        if (!list.length || snow <= 0) return;
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (const f of flakes.current) {
          if (f.z < loZ || f.z >= hiZ || snow < f.gate) continue;
          const size = unit * (0.012 + f.z * 0.045);
          const px = (f.x + Math.sin(time * f.swaySpeed + f.phase) * f.swayAmp) * W;
          const py = f.y * H;
          const born = clamp((snow - f.gate) * 6);
          const edge = Math.min(clamp(f.y * 8), clamp((1.1 - f.y) * 6));
          const a = born * edge * (0.18 + f.z * 0.5);
          if (a <= 0.004) continue;
          ctx.globalAlpha = a;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(f.rot);
          ctx.drawImage(list[f.sprite], -size / 2, -size / 2, size, size);
          ctx.restore();
        }
        ctx.restore();
      };

      drawSnow(0, 0.45);

      // --- the machine, with a slow scroll-tied push-in ---
      const img = machine.current;
      if (img) {
        const maxW = W * (wide ? 0.42 : 0.62);
        const maxH = H * (wide ? 0.84 : 0.42);
        const fit = Math.min(maxH / img.height, maxW / img.width);
        const scale = (0.9 + p * 0.08) * fit;
        const w = img.width * scale;
        const h = img.height * scale;
        const x = W * cx - w / 2;
        const y = H * cy - h / 2 - p * H * 0.035;

        // door glow ramps up as it cools
        ctx.save();
        ctx.shadowColor = `rgba(37,25,231,${0.3 + chill * 0.6})`;
        ctx.shadowBlur = (28 + chill * 90) * (W / 1400);
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();

        // cool the whole render toward blue as temperature drops
        if (chill > 0) {
          ctx.save();
          ctx.globalCompositeOperation = "overlay";
          ctx.globalAlpha = chill * 0.32;
          ctx.fillStyle = "#2519e7";
          ctx.fillRect(x, y, w, h);
          ctx.restore();
        }

        // --- callout markers, pinned to the machine -------------------------
        // Which callout is current is derived here rather than read from state,
        // so the loop never needs restarting when it changes.
        let spot = 0;
        for (let i = 0; i < HOTSPOTS.length; i++) if (p >= HOTSPOTS[i].at) spot = i;

        // A spotlight that eases between markers. Travelling light is what
        // makes the change legible — a hard cut between two points on a mostly
        // white render reads as nothing at all.
        const target = HOTSPOTS[spot];
        const tx = x + target.x * w;
        const ty = y + target.y * h;
        if (!glow.current) glow.current = { x: tx, y: ty };
        glow.current.x += (tx - glow.current.x) * 0.07;
        glow.current.y += (ty - glow.current.y) * 0.07;

        const gr = Math.min(W, H) * 0.17;
        const pulse = 0.82 + Math.sin(time * 1.9) * 0.18;
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const spotlight = ctx.createRadialGradient(
          glow.current.x, glow.current.y, 0,
          glow.current.x, glow.current.y, gr
        );
        spotlight.addColorStop(0, `rgba(140,175,255,${0.3 * pulse})`);
        spotlight.addColorStop(0.5, `rgba(90,130,255,${0.1 * pulse})`);
        spotlight.addColorStop(1, "rgba(90,130,255,0)");
        ctx.fillStyle = spotlight;
        ctx.beginPath();
        ctx.arc(glow.current.x, glow.current.y, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Position the numbered DOM markers over the same points. The markers
        // layer shares the canvas's box, so canvas pixels convert with dpr
        // alone. Hidden on narrow layouts, where the machine is a third of the
        // size and the callouts sit directly beneath it anyway.
        for (let i = 0; i < HOTSPOTS.length; i++) {
          const el = markerRefs.current[i];
          if (!el) continue;
          if (!wide) {
            el.style.opacity = "0";
            continue;
          }
          const hs = HOTSPOTS[i];
          const mx = (x + hs.x * w) / dpr.current;
          const my = (y + hs.y * h) / dpr.current;
          el.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
          el.style.opacity = "1";
        }
      }

      // --- nitrogen-free vapor pooling at the base ---
      const vapor = mapRange(p, 0.25, 0.85, 0, 1);
      if (vapor > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (const m of motes.current) {
          m.x += m.vx;
          m.y += m.vy;
          m.life += 0.0016;
          if (m.y < 0.35) { m.y = 1.05; m.life = 0; }
          if (m.x < -0.1) m.x = 1.1;
          if (m.x > 1.1) m.x = -0.1;

          const fade = Math.sin(clamp(m.life) * Math.PI);
          const a = fade * vapor * 0.16;
          if (a <= 0.002) continue;
          const px = m.x * W;
          const py = m.y * H + Math.sin(time * 0.4 + m.r) * H * 0.006;
          const pr = m.r * (W / 1400) * (1 + vapor * 0.5);
          const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
          g.addColorStop(0, `rgba(190,214,255,${a})`);
          g.addColorStop(1, "rgba(190,214,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // --- scrim under the copy ---
      // Snow falls across the whole frame, so the text needs a darker field
      // beneath it or flakes land in the middle of letterforms.
      if (wide) {
        const g = ctx.createLinearGradient(0, 0, W * 0.55, 0);
        g.addColorStop(0, "rgba(11,7,20,0.74)");
        g.addColorStop(1, "rgba(11,7,20,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      } else {
        const top = ctx.createLinearGradient(0, 0, 0, H * 0.34);
        top.addColorStop(0, "rgba(11,7,20,0.8)");
        top.addColorStop(1, "rgba(11,7,20,0)");
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, W, H * 0.34);

        const bot = ctx.createLinearGradient(0, H, 0, H * 0.6);
        bot.addColorStop(0, "rgba(11,7,20,0.85)");
        bot.addColorStop(1, "rgba(11,7,20,0)");
        ctx.fillStyle = bot;
        ctx.fillRect(0, H * 0.6, W, H * 0.4);
      }

      // --- vignette to seat it in the page, pulled toward the active callout ---
      // This is what actually makes the callout change visible. The additive
      // glow above only registers on the dark page and the blue interior; on
      // the machine's white shell, screen-blending onto near-white does
      // nothing. Moving the vignette's bright zone instead dims everything
      // *except* the part being named, so the same budget buys a travelling
      // spotlight. Weighted at 0.7 so it drifts rather than lurches.
      const focusX = glow.current ? W / 2 + (glow.current.x - W / 2) * 0.7 : W / 2;
      const focusY = glow.current ? H / 2 + (glow.current.y - H / 2) * 0.7 : H / 2;
      const vig = ctx.createRadialGradient(
        focusX, focusY, Math.min(W, H) * 0.3,
        focusX, focusY, Math.max(W, H) * 0.78
      );
      vig.addColorStop(0, "rgba(11,7,20,0)");
      vig.addColorStop(1, "rgba(11,7,20,0.72)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [progress, reduced, imgReady, onScreen]);

  // ---- temperature readout + hotspot state --------------------------------
  useEffect(() => {
    if (reduced || !active) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = clamp(progress.current ?? 0);
      const f = Math.round(mapRange(p, 0.05, 0.75, AMBIENT_F, TARGET_F));
      setTemp((prev) => (prev === f ? prev : f));

      let spot = 0;
      for (let i = 0; i < HOTSPOTS.length; i++) if (p >= HOTSPOTS[i].at) spot = i;
      setActiveSpot((s) => (s === spot ? s : spot));

      // Continuous fill, written straight to the DOM. Segments that only
      // switched on at each threshold gave no feedback between callouts, which
      // is most of the scroll.
      for (let i = 0; i < HOTSPOTS.length; i++) {
        const el = railRefs.current[i];
        if (!el) continue;
        const start = HOTSPOTS[i].at;
        el.style.transform = `scaleX(${clamp((p - start) / (SPOT_END[i] - start))})`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, reduced, active]);

  // ---- reduced motion fallback --------------------------------------------
  if (reduced) {
    return (
      <section className="bg-ink py-24" aria-labelledby="machine-title">
        <div className="shell">
          <p className="eyebrow mb-4">The chamber</p>
          <h2 id="machine-title" className="text-h2 max-w-3xl">
            A MECOTEC cryo:one+. No nitrogen, no gimmicks.
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/cryoone-1000.webp"
            alt="The MECOTEC cryo:one+ whole-body cryotherapy chamber."
            className="mx-auto mt-10 w-full max-w-md"
            loading="lazy"
          />
          <dl className="mt-12 grid gap-8 sm:grid-cols-3">
            {HOTSPOTS.map((h, i) => (
              <div key={h.title}>
                <span className="font-mono text-sm text-brand-bright" aria-hidden>
                  0{i + 1}
                </span>
                <dt className="text-h3 mt-3">{h.title}</dt>
                <dd className="mt-2 text-frost-dim">{h.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink"
      style={{ height: "420vh" }}
      aria-labelledby="machine-title"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* Numbered markers tracking the machine. Shares the canvas's box so
            the loop can position them in the canvas's own coordinates. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {HOTSPOTS.map((h, i) => (
            <div
              key={h.title}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 opacity-0 transition-opacity duration-500 will-change-transform"
            >
              <span className="relative -left-1/2 -top-1/2 flex">
                {/* Dark halo, not a blue one: the pulse has to register on the
                    shell *and* on the lit interior, and blue on blue vanishes. */}
                {activeSpot === i && (
                  <span className="absolute -inset-1 animate-ping rounded-full bg-ink/40" />
                )}
                {/* Pins sit on a white shell, a bright blue interior, or the
                    dark page, so no single fill carries them. The active pin is
                    blue banded by a white ring and a dark one outside it —
                    whichever of the three it lands on, one of those reads. */}
                <span
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] transition-all duration-500 ${
                    activeSpot === i
                      ? "scale-110 bg-brand-bright text-white ring-2 ring-white shadow-[0_0_0_4px_rgba(11,7,20,0.45)]"
                      : "scale-[0.82] bg-ink/85 text-white ring-1 ring-white/45 backdrop-blur"
                  }`}
                >
                  {i + 1}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* pt clears the fixed header, which overlays these sticky panels. */}
        <div className="shell relative flex h-full flex-col justify-between pb-12 pt-24 lg:pb-16 lg:pt-28">
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            <div className="min-w-0 flex-1 sm:max-w-md">
              <p className="eyebrow mb-3">The chamber</p>
              <h2 id="machine-title" className="text-h2">
                No nitrogen.
                <br />
                No gimmicks.
              </h2>
              {/* Hidden on phones so the chamber has room to breathe. */}
              <p className="mt-5 hidden max-w-sm text-frost-dim sm:block">
                We run a MECOTEC <span className="text-white">cryo:one+</span> — the fully
                electric chamber used by pro sports and clinical programs worldwide.
              </p>
            </div>

            {/* temperature readout */}
            <div
              className="glass shrink-0 rounded-2xl px-3.5 py-3 text-right sm:px-5 sm:py-4"
              aria-hidden
            >
              <div
                className="font-mono text-xl font-medium tabular-nums sm:text-3xl lg:text-4xl"
                style={{
                  color: `color-mix(in oklab, #4b78ff ${mapRange(
                    temp, AMBIENT_F, TARGET_F, 0, 100
                  )}%, #ffffff)`,
                }}
              >
                {temp}°F
              </div>
              <div className="eyebrow mt-1">chamber air</div>
            </div>
          </div>

          {/* hotspot callouts */}
          <div>
            {/* Persistent rail. The count used to live inside each callout, so
                it cross-faded with the copy and never read as a sequence. */}
            <div className="mb-5 flex items-center gap-2" aria-hidden>
              {HOTSPOTS.map((h, i) => (
                <span
                  key={h.title}
                  className="h-[3px] w-9 overflow-hidden rounded-full bg-white/15 sm:w-12"
                >
                  <span
                    ref={(el) => {
                      railRefs.current[i] = el;
                    }}
                    className="block h-full origin-left rounded-full bg-brand-bright"
                    style={{ transform: "scaleX(0)" }}
                  />
                </span>
              ))}
              <span className="eyebrow ml-2 !text-brand-bright">
                0{activeSpot + 1} / 0{HOTSPOTS.length}
              </span>
            </div>

            <div className="relative h-36 sm:h-32">
              {HOTSPOTS.map((h, i) => (
                <div
                  key={h.title}
                  className="absolute inset-x-0 top-0 max-w-md transition-all duration-500"
                  style={{
                    opacity: activeSpot === i ? 1 : 0,
                    transform: `translateY(${activeSpot === i ? 0 : 16}px)`,
                  }}
                  aria-hidden={activeSpot !== i}
                >
                  <h3 className="text-h3">{h.title}</h3>
                  <p className="mt-2 text-frost-dim">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { easeInOut, useMediaQuery, usePrefersReducedMotion } from "@/lib/scroll";

/**
 * A sheet of frost over the hero that you wipe away with the pointer.
 *
 * The whole page is about cold, so the hero's one interaction is the one you'd
 * actually do to a frozen chamber door. Wiping reveals the deep blue glow of
 * the footage underneath, and the frost creeps back over ~7 seconds.
 *
 * It is a delight layer, never a barrier:
 * - the canvas is `pointer-events: none`, so it can't eat clicks on the CTAs
 * - the copy column has a falloff baked into the frost texture, so the
 *   headline is never sitting under ice
 * - an intro wipe runs once on load, so touch users and anyone who never
 *   moves the mouse still see the scene
 * - `prefers-reduced-motion` renders nothing at all
 */
export default function FrostLayer({
  clear = "left",
}: {
  /** Which side the copy sits on, and therefore stays thin. */
  clear?: "left" | "right";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const [wiped, setWiped] = useState(false);
  // The hint only makes sense where there's a hovering pointer to wipe with.
  const fine = useMediaQuery("(pointer: fine)");

  useEffect(() => {
    if (reduced) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let texture: HTMLCanvasElement | null = null;
    let W = 0;
    let H = 0;
    let visible = true;
    let introAt = 0;
    let announced = false;
    let tick = 0;
    let moved = false;
    let freezeUntil = 0;
    const REFREEZE_MS = 8200;
    const ptr = { x: 0, y: 0, lx: 0, ly: 0, has: false, inside: false };

    /**
     * Frost is baked once and re-composited at low alpha to refreeze, so the
     * pattern stays put instead of shimmering, and the copy-column falloff
     * restores itself for free.
     */
    const makeTexture = (w: number, h: number) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d");
      if (!g) return c;

      const unit = Math.min(w, h);
      let s = 20240817;
      const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

      // A cool grey rather than near-white. Real frost dulls and diffuses the
      // light behind it, so the frozen state is flat and wiping is what makes
      // the chamber glow — bright frost made both states look the same.
      g.fillStyle = "rgba(176,196,230,0.88)";
      g.fillRect(0, 0, w, h);

      const blob = (fill: (a: number) => string, count: number, min: number, max: number) => {
        for (let i = 0; i < count; i++) {
          const x = rnd() * w;
          const y = rnd() * h;
          const r = unit * (min + rnd() * (max - min));
          const rg = g.createRadialGradient(x, y, 0, x, y, r);
          rg.addColorStop(0, fill(0.04 + rnd() * 0.13));
          rg.addColorStop(1, fill(0));
          g.fillStyle = rg;
          g.fillRect(x - r, y - r, r * 2, r * 2);
        }
      };

      blob((a) => `rgba(255,255,255,${a})`, 420, 0.012, 0.11);
      blob((a) => `rgba(126,158,220,${a})`, 120, 0.02, 0.14);

      // Small ice crystals embedded in the sheet. Without these the layer
      // reads as blur rather than frost, and they echo the snowflakes in the
      // chamber section.
      g.lineCap = "round";
      for (let i = 0; i < 150; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const r = unit * (0.004 + rnd() * 0.017);
        g.save();
        g.translate(x, y);
        g.rotate(rnd() * Math.PI);
        g.strokeStyle = `rgba(255,255,255,${0.12 + rnd() * 0.28})`;
        g.lineWidth = Math.max(0.6, r * 0.07);
        for (let k = 0; k < 6; k++) {
          g.rotate(Math.PI / 3);
          g.beginPath();
          g.moveTo(0, 0);
          g.lineTo(0, -r);
          g.stroke();
          for (const d of [-1, 1]) {
            g.beginPath();
            g.moveTo(0, -r * 0.55);
            g.lineTo(d * r * 0.24, -r * 0.8);
            g.stroke();
          }
        }
        g.restore();
      }

      // Crystal speckle — this is what stops it reading as a grey wash.
      for (let i = 0; i < 2400; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const r = unit * (0.0004 + rnd() * 0.0015);
        g.fillStyle = `rgba(255,255,255,${0.1 + rnd() * 0.35})`;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }

      g.globalCompositeOperation = "destination-out";
      if (w / h > 1.15) {
        // Side-by-side: thin the frost out under the copy column.
        const ramp =
          clear === "right"
            ? g.createLinearGradient(w, 0, w * 0.34, 0)
            : g.createLinearGradient(0, 0, w * 0.66, 0);
        ramp.addColorStop(0, "rgba(0,0,0,0.95)");
        ramp.addColorStop(0.42, "rgba(0,0,0,0.62)");
        ramp.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = ramp;
      } else {
        // Stacked: copy runs the full width, so the frost is a thin veil
        // everywhere and the vertical scrim does the legibility work.
        g.fillStyle = "rgba(0,0,0,0.52)";
      }
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "source-over";

      return c;
    };

    // Pre-rendered soft brush — building a fresh radial gradient per stamp,
    // up to 16 stamps a frame, was measurable.
    const brush = document.createElement("canvas");
    brush.width = 128;
    brush.height = 128;
    {
      const g = brush.getContext("2d");
      if (g) {
        const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        rg.addColorStop(0, "rgba(0,0,0,1)");
        rg.addColorStop(0.5, "rgba(0,0,0,0.45)");
        rg.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = rg;
        g.fillRect(0, 0, 128, 128);
      }
    }

    const erase = (x: number, y: number, r: number, strength: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = strength;
      ctx.drawImage(brush, x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      const r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return;
      // Frost is a soft texture, so the backing store runs below device
      // resolution and the compositor scales it up. At full DPR this one
      // layer pushed frame times past 100ms under software rasterisation.
      const s = Math.min(1, 1100 / r.width);
      const w = Math.round(r.width * s);
      const h = Math.round(r.height * s);
      if (!w || !h || (w === W && h === H)) return;
      W = w;
      H = h;
      cv.width = W;
      cv.height = H;
      texture = makeTexture(W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(texture, 0, 0);
      ptr.has = false;
      introAt = performance.now() + 500;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!texture || !visible || !W || !H) return;

      const t = (now - introAt) / 1700;
      const intro = t > 0 && t < 1;

      // Once nothing is being wiped and the sheet has finished refreezing the
      // canvas is static, so skip every draw. This layer covers the viewport,
      // so repainting it forces a full recomposite each frame — leaving it
      // alone is what keeps an idle hero at zero cost.
      if (!intro && !moved && now > freezeUntil) {
        ptr.lx = ptr.x;
        ptr.ly = ptr.y;
        return;
      }

      // Refreeze, stamped every third frame at triple strength.
      if (++tick % 3 === 0 && now < freezeUntil) {
        ctx.globalAlpha = 0.018;
        ctx.drawImage(texture, 0, 0);
        ctx.globalAlpha = 1;
      }

      if (intro) {
        const e = easeInOut(t);
        erase(
          W * (0.1 + e * 0.95),
          H * (0.6 - Math.sin(e * Math.PI) * 0.17),
          Math.min(W, H) * 0.3,
          0.5
        );
        freezeUntil = now + REFREEZE_MS;
      }

      if (moved) {
        // Interpolate along the travel so a fast flick doesn't leave gaps.
        const step = Math.min(W, H) * 0.022;
        const dist = Math.hypot(ptr.x - ptr.lx, ptr.y - ptr.ly);
        const n = Math.max(1, Math.min(16, Math.ceil(dist / step)));
        for (let i = 1; i <= n; i++) {
          erase(
            ptr.lx + ((ptr.x - ptr.lx) * i) / n,
            ptr.ly + ((ptr.y - ptr.ly) * i) / n,
            Math.min(W, H) * 0.1,
            0.26
          );
        }
        freezeUntil = now + REFREEZE_MS;
        moved = false;
      }

      ptr.lx = ptr.x;
      ptr.ly = ptr.y;
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = W / r.width;
      const inside =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      const x = (e.clientX - r.left) * dpr;
      const y = (e.clientY - r.top) * dpr;
      if (!ptr.has) {
        ptr.lx = x;
        ptr.ly = y;
        ptr.has = true;
      }
      ptr.x = x;
      ptr.y = y;
      ptr.inside = inside;
      // Only wake the loop for movement over the hero itself.
      if (inside) moved = true;
      if (inside && !announced) {
        announced = true;
        setWiped(true);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced, clear]);

  if (reduced) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />
      {fine && (
        <div
          className={`pointer-events-none absolute bottom-32 hidden items-center gap-2.5 transition-opacity duration-700 lg:flex ${
            clear === "right" ? "left-8 xl:left-16" : "right-8 xl:right-16"
          }`}
          style={{ opacity: wiped ? 0 : 1 }}
          aria-hidden
        >
          <span className="h-px w-8 bg-ink/40" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink/70">
            Wipe the frost
          </span>
        </div>
      )}
    </>
  );
}

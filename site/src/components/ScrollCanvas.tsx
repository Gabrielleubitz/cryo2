"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "@/lib/scroll";

type Props = {
  /** Builds the URL for a 1-based frame index. */
  frameUrl: (i: number, width: number) => string;
  frameCount: number;
  /** Candidate widths, smallest first. The narrowest that covers the viewport wins. */
  widths: number[];
  /** 0..1 scroll position, read every frame. Lives in a ref so React never re-renders. */
  progress: React.RefObject<number>;
  className?: string;
  /** Drawn behind the sequence while frames stream in. */
  poster?: string;
  onReady?: () => void;
  /** Progress is lerped toward the target; lower is smoother but laggier. */
  smoothing?: number;
  /** Cover-fit anchor, 0 = top edge, 1 = bottom edge. Keeps heads in frame. */
  focusY?: number;
  /** Cover-fit anchor on the horizontal axis. */
  focusX?: number;
  /** Gate for the preload, so offscreen sequences don't compete with the hero. */
  enabled?: boolean;
};

/**
 * Draws a preloaded image sequence to a canvas, scrubbed by scroll position.
 *
 * Frames are decoded to ImageBitmaps once and drawn with `drawImage`, which
 * keeps per-frame cost to a single GPU blit. The first and last frames are
 * fetched first so the section is never empty, then the rest stream in over a
 * small connection pool.
 */
/**
 * Frame indices ordered coarse-to-fine: both ends, then repeated bisection.
 *
 * The scrub holds the nearest loaded frame, so filling the timeline evenly
 * means an early scroll looks like a low-framerate version of the finished
 * sequence rather than snapping between the only two frames that exist.
 */
function bisectionOrder(count: number) {
  const order: number[] = [];
  const seen = new Uint8Array(count);
  const push = (i: number) => {
    if (i >= 0 && i < count && !seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(count - 1);
  for (let step = count >> 1; step >= 1; step >>= 1) {
    for (let i = step; i < count; i += step) push(i);
  }
  return order;
}

function ScrollCanvas({
  frameUrl,
  frameCount,
  widths,
  progress,
  className,
  poster,
  onReady,
  smoothing = 0.18,
  focusY = 0.5,
  focusX = 0.5,
  enabled = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(ImageBitmap | null)[]>([]);
  const drawn = useRef(-1);
  const eased = useRef(0);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  // Callers pass array literals; key on the contents so the preload effect
  // isn't torn down and restarted on every parent render.
  const widthKey = widths.join(",");

  // Latest `onReady` without making it an effect dependency.
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const pickWidth = useCallback(() => {
    const list = widthKey.split(",").map(Number);
    if (typeof window === "undefined") return list[list.length - 1];
    const need = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    return list.find((w) => w >= need) ?? list[list.length - 1];
  }, [widthKey]);

  // Enough of the timeline to scrub against before the poster is dropped.
  const readyAt = useMemo(() => Math.min(16, frameCount), [frameCount]);

  // ---- preload -------------------------------------------------------------
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const width = pickWidth();
    const store: (ImageBitmap | null)[] = new Array(frameCount).fill(null);
    frames.current = store;

    let done = 0;
    let announced = false;

    const fetchFrame = async (i: number) => {
      try {
        const res = await fetch(frameUrl(i + 1, width), { cache: "force-cache" });
        if (!res.ok) return;
        const bmp = await createImageBitmap(await res.blob());
        if (cancelled) return bmp.close();
        store[i] = bmp;
      } catch {
        /* a dropped frame just means the scrub holds its neighbour */
      } finally {
        if (cancelled) return;
        done++;
        // Only re-render while the loading chip is still on screen; after that
        // the count is invisible and a render per frame is pure waste.
        if (!announced) {
          setLoaded(done);
          if (done >= readyAt) {
            announced = true;
            setReady(true);
            onReadyRef.current?.();
          }
        }
      }
    };

    const queue = bisectionOrder(frameCount);
    const POOL = 6;
    Promise.all(
      Array.from({ length: POOL }, async () => {
        while (queue.length && !cancelled) await fetchFrame(queue.shift()!);
      })
    );

    return () => {
      cancelled = true;
      store.forEach((f) => f?.close());
      if (frames.current === store) frames.current = [];
    };
  }, [frameUrl, frameCount, pickWidth, enabled, readyAt]);

  // ---- size the backing store to the element * DPR -------------------------
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      drawn.current = -1; // force a repaint at the new size
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    return () => ro.disconnect();
  }, []);

  // ---- draw loop -----------------------------------------------------------
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    const paint = () => {
      raf = requestAnimationFrame(paint);

      // Lerp toward the scroll target so fast flicks don't strobe.
      const target = clamp(progress.current ?? 0);
      eased.current += (target - eased.current) * smoothing;
      if (Math.abs(target - eased.current) < 0.0005) eased.current = target;

      const idx = clamp(Math.round(eased.current * (frameCount - 1)), 0, frameCount - 1);

      // Hold the nearest loaded frame rather than flashing an empty canvas.
      let use = idx;
      if (!frames.current[use]) {
        let lo = idx,
          hi = idx;
        while (lo >= 0 || hi < frameCount) {
          if (lo >= 0 && frames.current[lo]) { use = lo; break; }
          if (hi < frameCount && frames.current[hi]) { use = hi; break; }
          lo--; hi++;
        }
      }
      const bmp = frames.current[use];
      if (!bmp || use === drawn.current) return;
      drawn.current = use;

      // cover-fit, anchored so the subject stays in frame on wide viewports
      const cw = cv.width, ch = cv.height;
      const scale = Math.max(cw / bmp.width, ch / bmp.height);
      const w = bmp.width * scale, h = bmp.height * scale;
      ctx.drawImage(bmp, (cw - w) * focusX, (ch - h) * focusY, w, h);
    };

    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [frameCount, progress, smoothing, focusX, focusY]);

  const pct = Math.min(100, Math.round((loaded / readyAt) * 100));

  return (
    <div className={className}>
      {poster && !ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      {!ready && (
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <div className="glass rounded-full px-4 py-2 font-mono text-[11px] tracking-widest text-frost-dim">
            LOADING {pct}%
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ScrollCanvas);

"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Remap `v` from [inMin,inMax] onto [outMin,outMax], clamped at both ends. */
export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  const t = clamp((v - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
};

export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/**
 * Subscribes to a media query.
 *
 * `serverValue` is what SSR assumes before hydration can read the real thing.
 */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useMemo(
    () => (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue
  );
}

export function usePrefersReducedMotion() {
  // Server render assumes motion is fine, then hydrates to the truth.
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

/**
 * True once `ref` comes within `margin` of the viewport, and stays true.
 *
 * Used to defer expensive preloading (frame sequences) until the section is
 * actually approaching, instead of competing with the hero for bandwidth.
 */
export function useNearViewport(
  ref: React.RefObject<HTMLElement | null>,
  margin = "150% 0px 150% 0px"
) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);

  return near;
}

/**
 * Scroll progress through a sticky section, as 0..1.
 *
 * 0 = the section's top hits the top of the viewport
 * 1 = the section's bottom reaches the bottom of the viewport
 *
 * Reads layout in a rAF loop that only runs while the section is on screen,
 * so offscreen sections cost nothing.
 */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const progress = useRef(0);
  const [active, setActive] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // `active` runs early so progress is warm before the section arrives.
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      rootMargin: "20% 0px 20% 0px",
    });
    io.observe(el);

    // `onScreen` is strict, for anything expensive enough that it must not run
    // off screen. Sections here are stacked flush, so the 20% margin above
    // reports the next one as active while you're still on the previous one.
    const strict = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    strict.observe(el);

    return () => {
      io.disconnect();
      strict.disconnect();
    };
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;

    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const scrollable = r.height - window.innerHeight;
      progress.current = scrollable <= 0 ? 0 : clamp(-r.top / scrollable);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ref, active]);

  return { progress, active, onScreen };
}

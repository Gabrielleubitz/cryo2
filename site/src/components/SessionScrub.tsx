"use client";

import { useEffect, useRef, useState } from "react";
import ScrollCanvas from "./ScrollCanvas";
import {
  clamp,
  mapRange,
  useNearViewport,
  useSectionProgress,
  usePrefersReducedMotion,
} from "@/lib/scroll";

const FRAME_COUNT = 120;

// Module scope so <ScrollCanvas> sees identical props across renders and its
// memo boundary holds — otherwise the preload restarts on every re-render.
const WIDTHS = [900, 1440];
const frameUrl = (i: number, width: number) =>
  `/seq/session/${width}/frame_${String(i).padStart(4, "0")}.webp`;

/** Copy beats pinned to scroll progress — the scroll *is* the three minutes. */
const BEATS = [
  {
    at: 0.04,
    clock: "0:00",
    title: "Step in.",
    body: "You stay fully clothed in shorts, a tee and socks. No water, no nitrogen, no shock — just dry, still cold.",
  },
  {
    at: 0.3,
    clock: "1:00",
    title: "The cold sets in.",
    body: "Air circulates evenly head-to-toe at −220°F. Your skin cools while your core stays safe and warm.",
  },
  {
    at: 0.56,
    clock: "2:00",
    title: "Blood rushes to your core.",
    body: "Vessels constrict, blood floods to your vital organs and reoxygenates. Inflammation starts backing off.",
  },
  {
    at: 0.8,
    clock: "3:00",
    title: "Step out lighter.",
    body: "Vessels reopen and that enriched blood floods back out. Endorphins spike. Most people feel it for hours.",
  },
];

export default function SessionScrub() {
  const sectionRef = useRef<HTMLElement>(null);
  const { progress } = useSectionProgress(sectionRef);
  const nearViewport = useNearViewport(sectionRef);
  const reduced = usePrefersReducedMotion();

  const [beat, setBeat] = useState(0);
  const clockRef = useRef<HTMLDivElement>(null);

  // Drive the copy beats and the running clock off the same progress ref. The
  // clock ticks ~180 times per pass, so it's written straight to the DOM; only
  // the beat (four changes) goes through state.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let lastClock = "";
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = clamp(progress.current ?? 0);

      let next = 0;
      for (let i = 0; i < BEATS.length; i++) if (p >= BEATS[i].at) next = i;
      setBeat((b) => (b === next ? b : next));

      // 0.04 -> 0.92 of the scroll maps to 0:00 -> 3:00
      const secs = Math.round(mapRange(p, 0.04, 0.92, 0, 180));
      const text = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
      if (text !== lastClock && clockRef.current) {
        lastClock = text;
        clockRef.current.textContent = text;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, reduced]);

  // ---- reduced motion: a plain, fully readable stack ------------------------
  if (reduced) {
    return (
      <section className="bg-ink py-24" aria-labelledby="session-title">
        <div className="shell">
          <p className="eyebrow mb-4">The session</p>
          <h2 id="session-title" className="text-h2 max-w-3xl">
            The best three minutes of your life.
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/seq/session/1440/frame_0060.webp"
            alt="A client stepping out of the cryo:one+ chamber surrounded by cold vapor."
            className="mt-10 w-full rounded-2xl"
            loading="lazy"
          />
          <ol className="mt-12 grid gap-8 sm:grid-cols-2">
            {BEATS.map((b) => (
              <li key={b.clock} className="glass rounded-2xl p-6">
                <span className="font-mono text-sm text-brand-bright">{b.clock}</span>
                <h3 className="text-h3 mt-2">{b.title}</h3>
                <p className="mt-2 text-frost-dim">{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink"
      style={{ height: "460vh" }}
      aria-labelledby="session-title"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <ScrollCanvas
          frameUrl={frameUrl}
          frameCount={FRAME_COUNT}
          widths={WIDTHS}
          progress={progress}
          poster="/img/session-poster.jpg"
          focusY={0.34}
          enabled={nearViewport}
          className="absolute inset-0 h-full w-full"
        />

        {/* Legibility scrim — the footage is bright blue behind white text. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,7,20,.88) 0%, rgba(11,7,20,.2) 32%, rgba(11,7,20,.28) 60%, rgba(11,7,20,.9) 100%)",
          }}
        />

        {/* pt clears the fixed header, which overlays these sticky panels. */}
        <div className="shell relative flex h-full flex-col justify-between pb-12 pt-24 lg:pb-16 lg:pt-28">
          {/* header */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">The session</p>
              <h2 id="session-title" className="text-h2 max-w-xl">
                The best three
                <br />
                minutes of your life.
              </h2>
            </div>

            {/* running clock */}
            <div
              className="glass hidden rounded-2xl px-5 py-4 text-right sm:block"
              aria-hidden
            >
              <div
                ref={clockRef}
                className="font-mono text-3xl font-medium tabular-nums text-white lg:text-4xl"
              >
                0:00
              </div>
              <div className="eyebrow mt-1">elapsed</div>
            </div>
          </div>

          {/* The clients stay in the left ~60% of every frame in this window,
              so the panel sits right, over the empty wall, instead of covering
              the subject. It keeps its own scrim regardless. */}
          {/* Needs an explicit width: `ml-auto` on a flex-column child drops
              the stretch, and the panels inside are absolutely positioned, so
              the box would otherwise collapse to zero and overflow the page. */}
          <div className="relative h-52 max-w-lg sm:h-44 lg:ml-auto lg:w-[27rem]">
            {BEATS.map((b, i) => (
              <div
                key={b.clock}
                className="glass absolute inset-x-0 bottom-0 rounded-2xl p-6 transition-all duration-700"
                style={{
                  opacity: beat === i ? 1 : 0,
                  transform: `translateY(${beat === i ? 0 : 16}px)`,
                  pointerEvents: beat === i ? "auto" : "none",
                }}
                aria-hidden={beat !== i}
              >
                <span className="font-mono text-sm text-brand-bright sm:hidden">
                  {b.clock}
                </span>
                <h3 className="text-h3 mt-1">{b.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-frost">{b.body}</p>
              </div>
            ))}
          </div>

          {/* progress rail */}
          <div className="mt-8" aria-hidden>
            <div className="flex justify-between">
              {BEATS.map((b, i) => (
                <span
                  key={b.clock}
                  className="font-mono text-[10px] tracking-widest transition-colors duration-500"
                  style={{ color: beat >= i ? "#4b78ff" : "#3a3350" }}
                >
                  {b.clock}
                </span>
              ))}
            </div>
            <div className="mt-2 h-px w-full bg-ink-line">
              <div
                className="h-px bg-brand-bright transition-[width] duration-300 ease-linear"
                style={{ width: `${((beat + 1) / BEATS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

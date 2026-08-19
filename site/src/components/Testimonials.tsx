"use client";

import { useRef, useState } from "react";

/**
 * Quotes are transcribed verbatim from each client's own video — nothing here
 * is written for them. `context` is the condition they describe on camera.
 */
const STORIES = [
  {
    id: "ken",
    name: "Ken",
    context: "Chronic back pain, five years post-surgery",
    line: "“I tried it out, and got out, and the pain was gone for the first time in that five-year period.”",
  },
  {
    id: "jane",
    name: "Jane",
    context: "75, rheumatoid arthritis",
    line: "“I'm feeling no back pain, and I'm feeling very energized.”",
  },
  {
    id: "nadine",
    name: "Nadine",
    context: "Healthcare provider, neck and lumbar pain",
    line: "“So much pain relief. My neck feels a lot better, as does my lumbar and my knee.”",
  },
  {
    id: "mary",
    name: "Mary",
    context: "Old shoulder injury, arthritis",
    line: "“I feel relief. It's not aching me like it was when I went in there.”",
  },
] as const;

export default function Testimonials() {
  const [playing, setPlaying] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});

  const toggle = (id: string) => {
    const el = refs.current[id];
    if (!el) return;

    // Only one story plays at a time.
    Object.entries(refs.current).forEach(([k, v]) => {
      if (k !== id && v) {
        v.pause();
        v.currentTime = 0;
        v.muted = true;
      }
    });

    if (playing === id) {
      el.pause();
      setPlaying(null);
    } else {
      el.muted = false;
      el.play().catch(() => {
        // Autoplay policy can still refuse; fall back to muted playback.
        el.muted = true;
        el.play().catch(() => {});
      });
      setPlaying(id);
    }
  };

  return (
    <section id="stories" className="scroll-mt-24 bg-ink py-24 lg:py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow mb-4">In their words</p>
            <h2 className="text-h2">Real clients. Not actors.</h2>
          </div>
          <p className="max-w-xs text-sm text-frost-dim">
            Filmed at our sister clinic in Dallas, PA, on the same MECOTEC
            equipment. Tap any story to play with sound.
          </p>
        </div>
      </div>

      {/* Edge-to-edge rail so it reads as a filmstrip on every screen size.
          The cards are shorter than the 9:16 source: the subjects sit low in
          frame, so cropping the ceiling away puts them nearer the middle and
          fits the whole card — quote, name and condition — on one screen.
          Narrow viewports stay taller, where the quote wraps to three lines. */}
      <ul
        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 lg:px-10"
        style={{ scrollbarWidth: "thin" }}
      >
        {STORIES.map((s) => {
          const isPlaying = playing === s.id;
          return (
            <li key={s.id} className="w-[68vw] shrink-0 snap-center sm:w-72 lg:w-80">
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-label={`${isPlaying ? "Pause" : "Play"} ${s.name}'s story`}
                className="group relative block w-full overflow-hidden rounded-2xl bg-ink-soft ring-1 ring-ink-line transition-colors hover:ring-brand"
              >
                <video
                  ref={(el) => {
                    refs.current[s.id] = el;
                  }}
                  className="aspect-[2/3] w-full object-cover object-[50%_42%] transition-[filter] duration-500 sm:aspect-[4/5]"
                  style={{
                    // Four brightly lit waiting-room clips read as pale
                    // rectangles against a near-black page. Cooling and
                    // dimming the poster pulls them into the palette; playing
                    // restores the footage exactly as shot.
                    filter: isPlaying
                      ? "none"
                      : "saturate(0.4) contrast(1.12) brightness(0.55)",
                  }}
                  poster={`/video/${s.id}-poster.jpg`}
                  preload="none"
                  playsInline
                  muted
                  onEnded={() => setPlaying(null)}
                >
                  <source src={`/video/${s.id}.mp4`} type="video/mp4" />
                </video>

                <div
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                  style={{
                    opacity: isPlaying ? 0 : 1,
                    // Quote ramp on top, flat cold wash underneath — together
                    // with the poster's desaturation this reads as one cool
                    // filmstrip rather than four different rooms.
                    background:
                      "linear-gradient(180deg, rgba(11,7,20,0) 28%, rgba(11,7,20,.55) 52%, rgba(11,7,20,.88) 74%, rgba(11,7,20,.97) 100%), linear-gradient(180deg, rgba(37,25,231,.16), rgba(37,25,231,.16))",
                  }}
                />

                {!isPlaying && (
                  <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand/90 ring-1 ring-white/25 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-bright">
                    <svg
                      width="18"
                      height="20"
                      viewBox="0 0 16 18"
                      fill="none"
                      aria-hidden
                    >
                      <path d="M15 9 0 17.66V.34L15 9Z" fill="#fff" />
                    </svg>
                  </span>
                )}

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-left transition-opacity duration-300"
                  style={{ opacity: isPlaying ? 0 : 1 }}
                >
                  <p className="text-sm leading-snug text-white">{s.line}</p>
                  <p className="eyebrow mt-2.5">{s.name}</p>
                  <p className="mt-1 text-xs text-frost-dim">{s.context}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="shell">
        <p className="max-w-2xl text-xs leading-relaxed text-frost-dim">
          Individual experiences vary. Cryotherapy is a wellness service, not a
          medical treatment, and nothing here is a claim to diagnose, treat or cure
          any condition.
        </p>
      </div>
    </section>
  );
}

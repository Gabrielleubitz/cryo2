"use client";

import { useEffect, useState } from "react";
import { SAFETY } from "@/lib/business";
import { usePrefersReducedMotion } from "@/lib/scroll";

const CYCLE_MS = 750;
const STEPS = 14;
const RESET_AT = 13;

/**
 * Chamber safety — original animation, not the posted board.
 *
 * A single figure is dressed for a whole-body session while the house rules
 * resolve around the booth. Contraindications run as a ticker under the stage.
 * Reduced-motion users get the same facts as a static list; the stage is not
 * mounted.
 */
export default function Safety() {
  const reduced = usePrefersReducedMotion();

  return (
    <section id="safety" className="scroll-mt-24 overflow-hidden bg-ink py-24 lg:py-32">
      <div className="shell">
        <p className="eyebrow mb-4">Before you step in</p>
        <h2 className="text-h2 max-w-3xl">The rules are the session.</h2>
        <p className="mt-5 max-w-xl text-frost-dim">
          Three minutes at −220°F only works if you arrive dry, covered, and
          alone in the booth. {SAFETY.provided} Everything else is on you.
        </p>
      </div>

      {reduced ? null : <Stage />}

      <div className="shell mt-16 grid gap-10 lg:grid-cols-3">
        <RuleGroup label="General" items={SAFETY.rules.map((r) => r.title)} />
        <RuleGroup
          label="Required attire"
          items={SAFETY.attire.map((a) =>
            "note" in a && a.note ? `${a.title} (${a.note.toLowerCase()})` : a.title
          )}
          footer={SAFETY.dryClothes}
        />
        <RuleGroup
          label="Not for"
          items={SAFETY.contraindications.map((c) => c.title)}
        />
      </div>
    </section>
  );
}

function RuleGroup({
  label,
  items,
  footer,
}: {
  label: string;
  items: readonly string[];
  footer?: string;
}) {
  return (
    <div>
      <p className="eyebrow mb-4">{label}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-frost">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-bright"
              aria-hidden
            />
            {item}
          </li>
        ))}
      </ul>
      {footer && (
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-brand-bright">
          {footer}
        </p>
      )}
    </div>
  );
}

function Stage() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setStep((s) => (s + 1) % STEPS),
      CYCLE_MS
    );
    return () => window.clearInterval(id);
  }, []);

  const ruleAt = [1, 3, 2];
  const ruleOn = (i: number) => step >= ruleAt[i] && step < RESET_AT;
  const kitOn = (i: number) => step >= 4 + i && step < RESET_AT;
  const tick = [...SAFETY.contraindications, ...SAFETY.contraindications];

  return (
    <div className="mt-14">
      <div className="shell">
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_18rem_1fr]">
          <ul className="order-2 flex flex-col gap-4 lg:order-1">
            {SAFETY.rules.map((r, i) => (
              <li
                key={r.id}
                className={`glass rounded-2xl p-5 transition-all duration-500 ${
                  ruleOn(i)
                    ? "ring-1 ring-brand-bright/70"
                    : "opacity-45"
                }`}
              >
                <p className="font-mono text-[11px] tracking-[0.2em] text-brand-bright">
                  0{i + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{r.title}</h3>
                <p className="mt-1 text-sm text-frost-dim">{r.body}</p>
              </li>
            ))}
          </ul>

          <div className="order-1 mx-auto w-full max-w-xs lg:order-2">
            <Booth step={step} />
            <p
              className={`mt-4 text-center font-mono text-[11px] uppercase tracking-[0.2em] transition-opacity duration-500 ${
                step >= 10 && step < RESET_AT ? "text-brand-bright opacity-100" : "text-frost-dim opacity-40"
              }`}
            >
              {SAFETY.dryClothes}
            </p>
          </div>

          <ul className="order-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {SAFETY.attire.map((a, i) => (
              <li
                key={a.id}
                className={`rounded-xl border px-3 py-3 transition-all duration-500 ${
                  kitOn(i)
                    ? "border-brand-bright/60 bg-brand/15"
                    : "border-ink-line opacity-40"
                }`}
              >
                <p className="text-sm font-medium text-white">{a.title}</p>
                {"note" in a && a.note && (
                  <p className="mt-0.5 text-[11px] text-frost-dim">{a.note}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="safety-ticker mt-12 border-y border-ink-line bg-ink-soft py-3" aria-hidden>
        <div className="safety-ticker-track">
          {tick.map((c, i) => (
            <span key={`${c.id}-${i}`} className="safety-ticker-item">
              <span aria-hidden>✕</span> {c.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Booth({ step }: { step: number }) {
  const on = (from: number) =>
    `transition-all duration-500 ${step >= from && step < RESET_AT ? "opacity-100" : "opacity-0"}`;

  return (
    <svg
      viewBox="0 0 240 420"
      className="mx-auto h-auto w-full max-w-[16rem] drop-shadow-[0_0_40px_rgba(37,25,231,0.35)]"
      role="img"
      aria-label="A single person being dressed for a whole-body cryotherapy session: mask, ear protection, cotton top, underwear, gloves, knee-high socks and warm slippers."
    >
      <defs>
        <linearGradient id="safety-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2519e7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#2519e7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="safety-shell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ece8f8" />
          <stop offset="100%" stopColor="#b8b0cc" />
        </linearGradient>
      </defs>

      <rect x="28" y="18" width="184" height="384" rx="28" fill="url(#safety-shell)" />
      <rect x="40" y="36" width="160" height="352" rx="18" fill="#0b0714" />
      <rect x="40" y="36" width="160" height="352" rx="18" fill="url(#safety-glow)" />
      <rect x="48" y="48" width="8" height="328" rx="4" fill="#4b78ff" opacity="0.85" />

      {/* Second figure dissolves so the booth reads as single occupancy. */}
      <g
        className={`origin-center transition-all duration-700 ${
          step >= 3 ? "opacity-0 -translate-x-4" : "opacity-30"
        }`}
        transform="translate(26 12) scale(0.9)"
      >
        <Figure fill="#6d7aa8" />
      </g>

      <g transform="translate(0 8)">
        <Figure fill="#8fa3c9" />

        <g
          fill="#4b78ff"
          className={`transition-opacity duration-700 ${step >= 1 ? "opacity-0" : "opacity-80"}`}
        >
          <circle cx="108" cy="168" r="3.2" />
          <circle cx="132" cy="196" r="2.6" />
          <circle cx="118" cy="232" r="3" />
          <circle cx="140" cy="258" r="2.4" />
        </g>

        <circle
          cx="78"
          cy="226"
          r="6"
          fill="none"
          stroke="#e8d48a"
          strokeWidth="2"
          className={`transition-all duration-700 ${
            step >= 2 ? "-translate-x-16 -translate-y-8 opacity-0" : "opacity-100"
          }`}
        />

        {/* Underwear */}
        <path
          d="M104 248h32c2 0 6 10 6 16h-44c0-6 4-16 6-16z"
          fill="#4b78ff"
          className={on(4)}
        />
        {/* Cotton top */}
        <g className={on(5)}>
          <path d="M96 148c8-10 48-10 56 0l6 18H90l6-18z" fill="#4b78ff" />
          <rect x="98" y="164" width="44" height="52" rx="6" fill="#6d8dff" />
        </g>
        <g className={on(6)}>
          <rect x="102" y="278" width="16" height="72" rx="4" fill="#4b78ff" />
          <rect x="122" y="278" width="16" height="72" rx="4" fill="#4b78ff" />
          <line
            x1="94"
            y1="278"
            x2="146"
            y2="278"
            stroke="#d6e4ff"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        </g>
        {/* Slippers */}
        <g className={on(7)}>
          <ellipse cx="110" cy="358" rx="14" ry="8" fill="#4b78ff" />
          <ellipse cx="130" cy="358" rx="14" ry="8" fill="#4b78ff" />
        </g>
        {/* Gloves */}
        <g className={on(8)}>
          <ellipse cx="79" cy="228" rx="11" ry="14" fill="#4b78ff" />
          <ellipse cx="161" cy="228" rx="11" ry="14" fill="#4b78ff" />
        </g>
        {/* Ear protection */}
        <g className={on(9)} fill="none" stroke="#4b78ff" strokeWidth="5" strokeLinecap="round">
          <path d="M102 96c-10 4-14 16-8 24" />
          <path d="M138 96c10 4 14 16 8 24" />
        </g>
        {/* Mask */}
        <g className={on(10)}>
          <rect x="108" y="108" width="24" height="16" rx="8" fill="#4b78ff" />
          <line x1="96" y1="114" x2="108" y2="116" stroke="#9db0d4" strokeWidth="2" />
          <line x1="144" y1="116" x2="132" y2="116" stroke="#9db0d4" strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
}

function Figure({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <circle cx="120" cy="96" r="20" />
      <rect x="102" y="118" width="36" height="22" rx="10" />
      <rect x="96" y="138" width="48" height="112" rx="16" />
      <rect x="68" y="148" width="22" height="78" rx="11" />
      <rect x="150" y="148" width="22" height="78" rx="11" />
      <rect x="102" y="244" width="16" height="110" rx="8" />
      <rect x="122" y="244" width="16" height="110" rx="8" />
    </g>
  );
}

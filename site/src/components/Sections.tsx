import Link from "next/link";
import { BENEFITS, BUSINESS, PACKAGES } from "@/lib/business";

/* ------------------------------------------------------------------ */
/* Trust bar                                                           */
/* ------------------------------------------------------------------ */

export function TrustBar() {
  const items = [
    "No liquid nitrogen",
    "Fully electric MECOTEC",
    "Locally owned",
    "Walk-ins welcome",
  ];
  return (
    <section className="border-y border-ink-line bg-ink-soft">
      <div className="shell flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5">
        {items.map((t) => (
          <span key={t} className="flex items-center gap-2.5 text-sm text-frost-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" aria-hidden />
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Benefits                                                            */
/* ------------------------------------------------------------------ */

export function Benefits() {
  return (
    <section id="benefits" className="scroll-mt-24 bg-ink py-24 lg:py-32">
      <div className="shell">
        <p className="eyebrow mb-4">Why people come back</p>
        {/* Two sentences, so the break is forced between them rather than after
            "Your". The measure has to clear the longer of the two lines in the
            condensed face, hence 4xl and not 2xl. */}
        <h2 className="text-h2 max-w-4xl">
          Cold is the trigger.{" "}
          <span className="lg:block">Your body does the rest.</span>
        </h2>
        <p className="mt-5 max-w-xl text-frost-dim">
          Extreme cold sends blood to your core to protect your organs. When you step
          out, it floods back oxygen-rich. That single reflex drives everything below.
        </p>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-ink-line sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <li
              key={b.title}
              className="group bg-ink-soft p-8 transition-colors hover:bg-ink-line/40"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-brand-bright">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="h-px flex-1 bg-ink-line transition-colors group-hover:bg-brand/60"
                  aria-hidden
                />
              </div>
              <h3 className="mt-6 text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-frost-dim">{b.body}</p>
            </li>
          ))}
          <li className="flex flex-col justify-between bg-brand p-8">
            <div>
              <h3 className="text-h3">Ready in three minutes?</h3>
              <p className="mt-2 text-sm text-white/85">
                Walk-ins welcome, seven days a week.
              </p>
            </div>
            <Link
              href={BUSINESS.bookingUrl}
              className="mt-6 inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
            >
              Book a session
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Localized cryo + facial                                             */
/* ------------------------------------------------------------------ */

export function Localized() {
  const uses = [
    "Pinpoint joint and injury pain",
    "Muscle strains and sprains",
    "Post-surgical recovery",
    "Cryo facial — tone, puffiness, fine lines",
  ];

  return (
    <section className="bg-ink-soft py-24 lg:py-32">
      <div className="shell grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="relative flex justify-center">
          <div className="bloom absolute inset-0 -z-10 scale-125 opacity-45" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/cryoair-unit-1100.webp"
            alt="The MECOTEC cryoair unit used for localized cryotherapy treatment."
            className="w-full max-w-sm"
            loading="lazy"
            width={1100}
            height={1926}
          />
        </div>

        <div>
          <p className="eyebrow mb-4">Localized treatment</p>
          {/* This sits in a half-width column, so the headline has to be short
              enough for the poster face — the previous wording broke into three
              ragged lines here. */}
          <h2 className="text-h2">Cold, exactly where it hurts.</h2>
          <p className="mt-6 text-frost-dim">
            Our MECOTEC <span className="text-white">cryoair</span> delivers a focused
            stream of ultra-cold air to a single area — a knee, a shoulder, a healing
            strain. It also takes a facemask attachment for cryo facials.
          </p>

          <ul className="mt-8 space-y-3">
            {uses.map((u) => (
              <li key={u} className="flex items-start gap-3 text-frost">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-bright"
                  aria-hidden
                />
                {u}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-frost-dim">
            Localized sessions are booked by appointment — call{" "}
            <a
              href={BUSINESS.phoneHref}
              className="text-white underline underline-offset-4 hover:text-brand-bright"
            >
              {BUSINESS.phoneDisplay}
            </a>{" "}
            for pricing.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-ink py-24 lg:py-32">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Packages</p>
          <h2 className="text-h2">Priced for who you are.</h2>
          <p className="mt-5 text-frost-dim">
            Pay per session or go unlimited for a month. No contracts, no signup fee,
            no membership you have to call to cancel.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PACKAGES.map((p) => (
            <div
              key={p.id}
              className={[
                "relative flex flex-col rounded-2xl p-8",
                p.featured
                  ? "bg-brand ring-1 ring-brand-bright"
                  : "bg-ink-soft ring-1 ring-ink-line",
              ].join(" ")}
            >
              {p.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-ink">
                  Most popular
                </span>
              )}

              {/* Two lines' worth reserved so the three cards stay in step:
                  "Military & First Responder" wraps and the others don't, which
                  otherwise pushed everything below it out of alignment. */}
              <h3 className="text-h3 lg:min-h-[2.3em]">{p.name}</h3>
              <p
                className={`mt-1 text-xs ${p.featured ? "text-white/85" : "text-frost-dim"}`}
              >
                {p.note}
              </p>
              <p
                className={`mt-4 text-sm leading-relaxed ${
                  p.featured ? "text-white/90" : "text-frost-dim"
                }`}
              >
                {p.blurb}
              </p>

              {p.unlimited && (
                <div
                  className={`mt-7 rounded-xl p-5 ${
                    p.featured ? "bg-white/15" : "bg-ink"
                  }`}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-4xl font-medium">
                      ${p.unlimited.price}
                    </span>
                    <span
                      className={`text-sm ${p.featured ? "text-white/85" : "text-frost-dim"}`}
                    >
                      /mo
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{p.unlimited.label}</p>
                  <p
                    className={`text-xs ${p.featured ? "text-white/85" : "text-frost-dim"}`}
                  >
                    {p.unlimited.fine}
                  </p>
                </div>
              )}

              <ul className="mt-7 space-y-3">
                {p.sessions.map((s) => (
                  <li
                    key={s.qty}
                    className={`flex items-baseline justify-between gap-4 border-b pb-3 text-sm ${
                      p.featured ? "border-white/15" : "border-ink-line"
                    }`}
                  >
                    <span className={p.featured ? "text-white/85" : "text-frost-dim"}>
                      {s.qty}
                    </span>
                    <span className="font-mono font-medium">
                      {s.strike && (
                        <span
                          className={`mr-2 line-through ${
                            p.featured ? "text-white/75" : "text-frost-dim/75"
                          }`}
                        >
                          ${s.strike}
                        </span>
                      )}
                      ${s.price}
                    </span>
                  </li>
                ))}
              </ul>

              <ul className="mt-6 space-y-2.5">
                {p.includes.map((inc) => (
                  <li
                    key={inc}
                    className={`flex items-start gap-2.5 text-sm ${
                      p.featured ? "text-white/85" : "text-frost-dim"
                    }`}
                  >
                    <svg
                      className="mt-1 shrink-0"
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M1 4.5 4.2 7.7 11 1"
                        stroke={p.featured ? "#fff" : "#4b78ff"}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {inc}
                  </li>
                ))}
              </ul>

              <div className="grow" />

              <Link
                href={BUSINESS.bookingUrl}
                className={`mt-8 rounded-full py-3.5 text-center text-sm font-medium transition-colors ${
                  p.featured
                    ? "bg-white text-ink hover:opacity-90"
                    : "bg-brand text-white hover:bg-brand-bright"
                }`}
              >
                Book {p.name.split(" ")[0].toLowerCase()}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-frost-dim">
          3-month, 6-month, annual and family plans are available —{" "}
          <a
            href={BUSINESS.phoneHref}
            className="text-white underline underline-offset-4 hover:text-brand-bright"
          >
            call us
          </a>{" "}
          and we&rsquo;ll sort one out.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Who we serve                                                        */
/* ------------------------------------------------------------------ */

export function WhoWeServe() {
  const schools = [
    "University of Scranton",
    "Penn State",
    "King's College",
    "Wilkes University",
    "Misericordia University",
    "Keystone College",
    "Lackawanna College",
  ];

  return (
    <section className="relative overflow-hidden bg-ink-soft py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow mb-4">Who walks in</p>
          <h2 className="text-h2">Not just athletes.</h2>
          <p className="mt-6 text-frost-dim">
            On any given day the chamber runs for a college pitcher between starts, a
            nurse coming off a double, a 70-year-old managing arthritis, and someone
            who just wants to sleep better. Same three minutes, different reasons.
          </p>

          <p className="mt-10 text-sm font-medium text-white">
            Athletes come to us from
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {schools.map((s) => (
              <li
                key={s}
                className="rounded-full border border-ink-line px-4 py-2 text-sm text-frost-dim"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4 self-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/local-900.webp"
            alt="An older couple jogging outdoors."
            className="aspect-[3/4] w-full rounded-2xl object-cover"
            loading="lazy"
            width={900}
            height={1200}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/recovery-900.webp"
            alt="Service members on a training march."
            className="mt-10 aspect-[3/4] w-full rounded-2xl object-cover"
            loading="lazy"
            width={900}
            height={1200}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Owners                                                              */
/* ------------------------------------------------------------------ */

export function Owners() {
  return (
    <section className="bg-ink py-24 lg:py-32">
      <div className="shell grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/owners-1600.webp"
          srcSet="/img/owners-800.webp 800w, /img/owners-1600.webp 1600w"
          sizes="(min-width: 1024px) 45vw, 100vw"
          alt="Mike Amory and Mark Heise, owners of Cryotherapy Rejuvenate, beside the MECOTEC cryo:one+ chamber."
          className="w-full rounded-2xl"
          loading="lazy"
          width={1600}
          height={1509}
        />

        <div>
          <p className="eyebrow mb-4">The owners</p>
          <h2 className="text-h2">Mike & Mark.</h2>
          <div className="mt-6 space-y-5 text-frost-dim">
            <p>
              <span className="text-white">Mike Amory</span> has been in medical devices
              since 1987 — he started at Johnson &amp; Johnson working operating rooms,
              then ran his own equipment business here in NEPA for two decades. Fifteen
              years traveling with a university baseball and football program is what
              convinced him athletes here needed something better for recovery.
            </p>
            <p>
              <span className="text-white">Mark Heise</span> spent 24 years in customer
              service and logistics before partnering up. He&rsquo;s the reason a first
              visit feels straightforward instead of intimidating.
            </p>
            <p>
              They brought whole-body cryotherapy to Dickson City so people here
              wouldn&rsquo;t have to drive to Philadelphia or New York for it. One of
              them is usually the person who greets you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

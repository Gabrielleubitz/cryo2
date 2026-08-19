import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import FrostLayer from "./FrostLayer";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Ambient chamber loop. Muted + playsInline so iOS autoplays it. */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/img/hero-poster.jpg"
        aria-hidden
      >
        <source src="/video/hero-loop.mp4" type="video/mp4" />
      </video>

      {/* Cold bloom, so the chamber reads as the light source in the room. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 22% 48%, rgba(37,25,231,.34) 0%, rgba(37,25,231,.08) 42%, rgba(11,7,20,0) 72%)",
        }}
      />

      <FrostLayer clear="right" />

      {/* Scrims sit above the frost. The horizontal one is strong exactly
          where the copy is and clears by ~62%, which is where the frost is
          thickest — so the ice stays bright and the text stays legible. */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(270deg, rgba(11,7,20,.93) 0%, rgba(11,7,20,.78) 30%, rgba(11,7,20,.28) 54%, rgba(11,7,20,0) 74%)",
        }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,7,20,.8) 0%, rgba(11,7,20,.62) 38%, rgba(11,7,20,.86) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,7,20,.78) 0%, rgba(11,7,20,0) 20%, rgba(11,7,20,0) 58%, rgba(11,7,20,.92) 100%)",
        }}
      />

      <div className="shell relative flex min-h-[100svh] flex-col py-8 lg:py-10">
        {/* Clears the fixed SiteHeader. */}
        <div className="h-14 lg:h-16" aria-hidden />

        {/* Copy sits right and low. The chamber fills the left of every frame of
            this shot, so text there would bury the one thing worth uncovering;
            anchoring it low leaves the frost room to read as a full sheet. */}
        <div className="flex flex-1 items-end">
          <div className="max-w-2xl pb-8 lg:ml-auto lg:max-w-3xl lg:pb-16">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 shrink-0 bg-brand-bright" aria-hidden />
              <p className="eyebrow">
                Dickson City, PA
                <span className="hidden sm:inline"> · Serving all of NEPA</span>
              </p>
            </div>

            <h1 className="text-display">
              Three minutes at{" "}
              {/* Anton has no italic, so the accent is colour only — a
                  synthesised oblique on a face this heavy smears. */}
              <span className="text-brand-bright">−220°F</span>
              .
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-relaxed text-frost">
              Fully electric whole-body cryotherapy — no liquid nitrogen, no ice
              bath, no downtime.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href={BUSINESS.bookingUrl}
                className="rounded-full bg-brand px-8 py-4 font-medium text-white transition-colors hover:bg-brand-bright"
              >
                Book your session
              </Link>
              <Link
                href="#pricing"
                className="glass rounded-full px-8 py-4 font-medium text-white transition-colors hover:border-brand-bright"
              >
                See packages
              </Link>
            </div>
          </div>
        </div>

        {/* The fine print used to be a fifth stacked line under the CTAs. It's
            the same register as the address, so it lives on the same rail. */}
        <div className="hairline flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-6 text-sm text-frost-dim">
          <p>
            {BUSINESS.street}, {BUSINESS.city}
          </p>
          {/* Separators only once the row fits on one line — wrapped, they
              orphan a slash at the start of the next line. */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-4">
            <span>
              From <span className="text-white">$20</span>
            </span>
            <span aria-hidden className="hidden text-ink-line sm:inline">
              /
            </span>
            <span>Walk-ins welcome</span>
            <span aria-hidden className="hidden text-ink-line sm:inline">
              /
            </span>
            <span>Open 7 days</span>
            <span aria-hidden className="hidden text-ink-line sm:inline">
              /
            </span>
            <a
              href={BUSINESS.phoneHref}
              className="text-white transition-colors hover:text-brand-bright"
            >
              {BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

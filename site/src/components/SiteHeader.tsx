"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BUSINESS } from "@/lib/business";

const LINKS = [
  { href: "/#chamber", label: "The chamber" },
  { href: "/#benefits", label: "Benefits" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#stories", label: "Stories" },
  { href: "/#safety", label: "Safety" },
  { href: "/#visit", label: "Visit" },
];

/**
 * Fixed header, transparent over the hero and solid once you leave it.
 *
 * The page is ~18 screens tall, so a header that scrolled away with the hero
 * left most of the page with no way to navigate or book.
 */
export default function SiteHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        solid
          ? "border-ink-line bg-ink/80 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex items-center justify-between gap-6 py-4 lg:py-5">
        <Link href="/" aria-label={`${BUSINESS.name} — home`} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo-white.webp"
            alt="Cryotherapy Rejuvenate"
            width={180}
            height={55}
            className="h-9 w-auto lg:h-10"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-frost-dim transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <a
            href={BUSINESS.phoneHref}
            className="hidden text-sm text-frost-dim transition-colors hover:text-white sm:block"
          >
            {BUSINESS.phoneDisplay}
          </a>
          <Link
            href={BUSINESS.bookingUrl}
            className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-brand"
          >
            Book now
          </Link>
        </div>
      </div>
    </header>
  );
}

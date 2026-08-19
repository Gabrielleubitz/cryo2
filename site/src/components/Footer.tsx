import Link from "next/link";
import { BUSINESS, FAQS } from "@/lib/business";

export function Faq() {
  return (
    <section className="bg-ink-soft py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-4">Questions</p>
          <h2 className="text-h2">First time?</h2>
          <p className="mt-5 text-frost-dim">
            Most people are surprised by how ordinary it feels. Here&rsquo;s what to
            expect.
          </p>
          <a
            href={BUSINESS.phoneHref}
            className="mt-8 inline-flex rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-bright"
          >
            Call {BUSINESS.phoneDisplay}
          </a>
        </div>

        <ul className="divide-y divide-ink-line border-y border-ink-line">
          {FAQS.map((f, i) => (
            <li key={f.q}>
              {/* First one starts open so the column doesn't read as a wall of
                  closed rows. */}
              <details className="group py-5" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-medium text-white [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    className="relative h-4 w-4 shrink-0 transition-transform duration-300 group-open:rotate-45"
                    aria-hidden
                  >
                    <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-brand-bright" />
                    <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-brand-bright" />
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl pr-10 leading-relaxed text-frost-dim">
                  {f.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Visit() {
  return (
    <section id="visit" className="scroll-mt-24 bg-ink py-24 lg:py-32">
      <div className="shell">
        <div className="relative overflow-hidden rounded-3xl bg-ink-soft ring-1 ring-ink-line">
          <div className="bloom absolute -right-40 -top-40 h-[36rem] w-[36rem] opacity-40" aria-hidden />

          <div className="relative grid gap-12 p-8 lg:grid-cols-2 lg:gap-16 lg:p-14">
            <div>
              <p className="eyebrow mb-4">Come see us</p>
              <h2 className="text-h2">
                Walk in.
                <br />
                Chill out.
                <br />
                Feel better.
              </h2>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={BUSINESS.bookingUrl}
                  className="rounded-full bg-brand px-8 py-4 font-medium text-white transition-colors hover:bg-brand-bright"
                >
                  Book a session
                </Link>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass rounded-full px-8 py-4 font-medium text-white transition-colors hover:border-brand-bright"
                >
                  Get directions
                </a>
              </div>
            </div>

            {/* Single column on purpose. This sits inside a half-width card, so
                splitting it in two left neither side wide enough: the street
                orphaned "Highway" onto its own line and the email broke
                mid-word. Stacking costs nothing — the card had spare height. */}
            <dl className="grid gap-8">
              <div>
                <dt className="eyebrow">Location</dt>
                <dd className="mt-3 text-frost">
                  <a
                    href={BUSINESS.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-bright"
                  >
                    {BUSINESS.street}
                    <br />
                    {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="eyebrow">Contact</dt>
                <dd className="mt-3 space-y-1 text-frost">
                  <a href={BUSINESS.phoneHref} className="block hover:text-brand-bright">
                    {BUSINESS.phoneDisplay}
                  </a>
                  <a
                    href={`mailto:${BUSINESS.email}`}
                    className="block text-sm [overflow-wrap:anywhere] hover:text-brand-bright"
                  >
                    {BUSINESS.email}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="eyebrow">Hours</dt>
                <dd className="mt-3 space-y-1.5">
                  {BUSINESS.hours.map((h) => (
                    <div
                      key={h.days}
                      className="flex justify-between gap-6 border-b border-ink-line pb-1.5 text-sm"
                    >
                      <span className="text-frost-dim">{h.days}</span>
                      <span className="font-mono text-frost">{h.time}</span>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const links = [
    { href: "/about", label: "About" },
    { href: "/packages", label: "Packages" },
    { href: "/faq", label: "FAQs" },
    { href: "/#safety", label: "Safety" },
    { href: "/contact", label: "Contact" },
    { href: "/client-agreement", label: "Client agreement" },
    { href: "/privacy", label: "Privacy" },
  ];

  return (
    <footer className="border-t border-ink-line bg-ink-soft py-14">
      <div className="shell">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/logo-white.webp"
              alt="Cryotherapy Rejuvenate"
              width={180}
              height={55}
              className="h-9 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm text-frost-dim">
              Whole-body and localized cryotherapy in Dickson City, serving Scranton and
              Northeastern Pennsylvania.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-frost-dim transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="text-sm text-frost-dim">
            <a href={BUSINESS.phoneHref} className="block text-white hover:text-brand-bright">
              {BUSINESS.phoneDisplay}
            </a>
            <p className="mt-2">{BUSINESS.street}</p>
            <p>
              {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
            </p>
            <div className="mt-4 flex gap-4">
              <a href={BUSINESS.social.facebook} target="_blank" rel="noreferrer" className="hover:text-white">
                Facebook
              </a>
              <a href={BUSINESS.social.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="hairline mt-12 flex flex-wrap justify-between gap-4 pt-6 text-xs text-frost-dim">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <p>
            Cryotherapy is not a medical treatment and is not intended to diagnose or
            cure any condition.
          </p>
        </div>
      </div>
    </footer>
  );
}

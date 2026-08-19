import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { SiteFooter } from "./Footer";

/**
 * Placeholder shell for the secondary routes. The landing page is the shipped
 * surface; these exist so navigation and the footer never dead-end.
 */
export default function StubPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <main id="main" className="min-h-[70vh] pt-28 lg:pt-32">
        <div className="shell">
          <Link
            href="/"
            className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-white"
          >
            ← Back home
          </Link>

          <h1 className="text-h2 mt-10 max-w-3xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-frost-dim">{intro}</p>

          {children}

          <div className="mt-14 flex flex-wrap gap-4 pb-24">
            <Link
              href={BUSINESS.bookingUrl}
              className="rounded-full bg-brand px-8 py-4 font-medium text-white transition-colors hover:bg-brand-bright"
            >
              Book a session
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="glass rounded-full px-8 py-4 font-medium text-white transition-colors hover:border-brand-bright"
            >
              Call {BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

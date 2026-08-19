import type { Metadata } from "next";
import StubPage from "@/components/StubPage";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact & Hours",
  description: `Visit Cryotherapy Rejuvenate at ${BUSINESS.address}. Open seven days a week. Call ${BUSINESS.phoneDisplay}.`,
};

export default function Page() {
  return (
    <StubPage
      title="Contact & hours"
      intro="We're on the Scranton Carbondale Highway, open seven days a week. Walk-ins are welcome."
    >
      <dl className="mt-12 grid max-w-3xl gap-8 sm:grid-cols-2">
        <div>
          <dt className="eyebrow">Location</dt>
          <dd className="mt-3">
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-frost hover:text-brand-bright"
            >
              {BUSINESS.street}
              <br />
              {BUSINESS.city}, {BUSINESS.state} {BUSINESS.zip}
            </a>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Contact</dt>
          <dd className="mt-3 space-y-1">
            <a href={BUSINESS.phoneHref} className="block text-frost hover:text-brand-bright">
              {BUSINESS.phoneDisplay}
            </a>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="block [overflow-wrap:anywhere] text-frost hover:text-brand-bright"
            >
              {BUSINESS.email}
            </a>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="eyebrow">Hours</dt>
          <dd className="mt-3 max-w-md space-y-1.5">
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
    </StubPage>
  );
}

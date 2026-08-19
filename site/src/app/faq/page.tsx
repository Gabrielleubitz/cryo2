import type { Metadata } from "next";
import StubPage from "@/components/StubPage";
import { FAQS } from "@/lib/business";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "What to wear, how cold it gets, whether you need an appointment, and everything else first-time cryotherapy clients ask.",
};

export default function Page() {
  return (
    <StubPage
      title="Frequently asked questions"
      intro="Everything first-timers ask before their first three minutes."
    >
      <ul className="mt-12 max-w-3xl divide-y divide-ink-line border-y border-ink-line">
        {FAQS.map((f) => (
          <li key={f.q} className="py-6">
            <h2 className="font-medium text-white">{f.q}</h2>
            <p className="mt-2 leading-relaxed text-frost-dim">{f.a}</p>
          </li>
        ))}
      </ul>
    </StubPage>
  );
}

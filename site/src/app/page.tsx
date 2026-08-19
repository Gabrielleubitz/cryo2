import Hero from "@/components/Hero";
import MachineCanvas from "@/components/MachineCanvas";
import SessionScrub from "@/components/SessionScrub";
import Testimonials from "@/components/Testimonials";
import Safety from "@/components/Safety";
import { Faq, SiteFooter, Visit } from "@/components/Footer";
import {
  Benefits,
  Localized,
  Owners,
  Pricing,
  TrustBar,
  WhoWeServe,
} from "@/components/Sections";
import { BUSINESS, FAQS } from "@/lib/business";

function StructuredData() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": "https://cryotherapyrejuvenate.com/#business",
    name: BUSINESS.name,
    description:
      "Whole-body and localized cryotherapy in Dickson City, PA, using a fully electric MECOTEC cryo:one+ chamber.",
    url: "https://cryotherapyrejuvenate.com",
    telephone: BUSINESS.phoneDisplay,
    email: BUSINESS.email,
    image: "https://cryotherapyrejuvenate.com/img/chamber-hero-1920.webp",
    priceRange: "$20–$225",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.state,
      postalCode: BUSINESS.zip,
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: "Dickson City" },
      { "@type": "City", name: "Scranton" },
      { "@type": "AdministrativeArea", name: "Northeastern Pennsylvania" },
    ],
    openingHoursSpecification: BUSINESS.schemaHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [BUSINESS.social.facebook, BUSINESS.social.instagram],
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}

export default function Home() {
  return (
    <>
      <StructuredData />
      <main id="main">
        <Hero />
        <TrustBar />
        <div id="chamber" className="scroll-mt-0">
          <MachineCanvas />
        </div>
        <Benefits />
        <SessionScrub />
        <Localized />
        <Pricing />
        <Testimonials />
        <WhoWeServe />
        <Owners />
        <Faq />
        <Safety />
        <Visit />
      </main>
      <SiteFooter />
    </>
  );
}

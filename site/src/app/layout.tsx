import type { Metadata, Viewport } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BUSINESS } from "@/lib/business";
import SmoothScroll from "@/components/SmoothScroll";
import SiteHeader from "@/components/SiteHeader";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
// Condensed poster weight for headlines, against clinical mono readouts and a
// neutral sans body. Anton ships one weight and no italic, so hierarchy comes
// from size and case rather than weight or style.
const display = Anton({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: "400",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cryotherapyrejuvenate.com"),
  title: {
    default: "Whole-Body Cryotherapy in Dickson City, PA | Cryotherapy Rejuvenate",
    template: "%s | Cryotherapy Rejuvenate",
  },
  description:
    "Three minutes at −220°F. Electric whole-body cryotherapy with no liquid nitrogen, in Dickson City, PA. Recovery, pain relief and skin rejuvenation for NEPA athletes, adults and first responders.",
  keywords: [
    "cryotherapy Dickson City",
    "cryotherapy Scranton",
    "whole body cryotherapy NEPA",
    "MECOTEC cryo chamber",
    "cryo facial Scranton",
    "athlete recovery Pennsylvania",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cryotherapyrejuvenate.com",
    siteName: BUSINESS.name,
    title: "Whole-Body Cryotherapy in Dickson City, PA | Cryotherapy Rejuvenate",
    description:
      "Three minutes at −220°F. Fully electric whole-body cryotherapy — no liquid nitrogen — in Dickson City, PA.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0b0714",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

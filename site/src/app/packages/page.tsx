import type { Metadata } from "next";
import StubPage from "@/components/StubPage";
import { Pricing } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Packages & Pricing",
  description:
    "Cryotherapy packages for student-athletes, adults and first responders in Dickson City, PA. Sessions from $20, monthly unlimited from $175.",
};

export default function Page() {
  return (
    <StubPage
      title="Packages & pricing"
      intro="Pay per session or go unlimited for a month. No contracts and no signup fees."
    >
      <div className="-mx-6 mt-4 lg:-mx-10">
        <Pricing />
      </div>
    </StubPage>
  );
}

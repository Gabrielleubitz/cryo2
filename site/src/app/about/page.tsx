import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "Cryotherapy Rejuvenate is owned by Mike Amory and Mark Heise, serving Dickson City, Scranton and the wider NEPA region.",
};

export default function Page() {
  return (
    <StubPage
      title="About Cryotherapy Rejuvenate"
      intro="Mike Amory and Mark Heise brought whole-body cryotherapy to Dickson City so people in NEPA wouldn't have to drive hours for it. The full story is on the way — for now, the short version lives on the home page."
    />
  );
}

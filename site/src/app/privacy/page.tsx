import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <StubPage
      title="Privacy policy"
      intro="The existing privacy policy needs to be reviewed and carried over from the current site before this page goes live."
    />
  );
}

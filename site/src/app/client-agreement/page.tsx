import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Client Agreement",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <StubPage
      title="Client agreement"
      intro="Every client completes a short health screening and waiver before their first session. The current agreement text needs to be carried over from the existing site before this page goes live."
    />
  );
}

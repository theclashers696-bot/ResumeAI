import type { Metadata } from "next";
import { ShareLinkClient } from "@/components/public/share-link-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Shared Resume — ResumeAI",
  description: "View a shared resume on ResumeAI",
  robots: { index: false, follow: false },
};

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;
  return <ShareLinkClient token={token} />;
}

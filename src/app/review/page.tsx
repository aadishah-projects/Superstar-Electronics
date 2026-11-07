import type { Metadata } from "next";
import { ReviewFlow } from "@/components/review-flow";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Share Your Experience",
    description: "Share your experience with Super Star Electronics Industries.",
    path: "/review",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReviewPage() {
  return <ReviewFlow />;
}

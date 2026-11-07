import { getFirebaseAdminDb } from "@/lib/integrations/firebase-admin";

export async function saveCustomerReview(input: {
  rating: number;
  reviewText: string;
  templateId: string;
  photoName: string | null;
  photoKey: string | null;
  photoMimeType: string | null;
}) {
  const review = getFirebaseAdminDb().collection("customer_reviews").doc();
  await review.set({
    rating: input.rating,
    reviewText: input.reviewText,
    templateId: input.templateId,
    photoName: input.photoName,
    photoKey: input.photoKey,
    photoMimeType: input.photoMimeType,
    storage: input.photoKey ? "cloudflare-r2" : null,
    source: "public-review-page",
    createdAt: new Date(),
  });

  return review.id;
}

import { NextResponse } from "next/server";
import { saveCustomerReview } from "@/lib/integrations/customer-reviews";
import { deletePrivateReviewR2Object, hasReviewR2Config, putPrivateReviewR2Object } from "@/lib/integrations/r2";

export const runtime = "nodejs";

type ReviewPhoto = {
  name?: unknown;
  mimeType?: unknown;
  base64?: unknown;
};

type ReviewPayload = {
  rating?: unknown;
  reviewText?: unknown;
  templateId?: unknown;
  photo?: ReviewPhoto | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReviewPayload;
    const rating = Number(body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: "Please choose a valid rating." }, { status: 400 });
    }

    const reviewText = typeof body.reviewText === "string" ? body.reviewText.slice(0, 2000) : "";
    const templateId = typeof body.templateId === "string" ? body.templateId.slice(0, 80) : "";
    let photo: { name: string; mimeType: string; base64: string } | null = null;

    if (isRecord(body.photo)) {
      const photoName = typeof body.photo.name === "string" ? body.photo.name.slice(0, 120) : "review-photo.jpg";
      const mimeType = typeof body.photo.mimeType === "string" ? body.photo.mimeType : "image/jpeg";
      const base64 = typeof body.photo.base64 === "string" ? body.photo.base64 : "";

      if (!mimeType.startsWith("image/") || !base64) {
        return NextResponse.json({ ok: false, error: "The selected photo is not valid." }, { status: 400 });
      }

      if (base64.length > 7_000_000) {
        return NextResponse.json({ ok: false, error: "Please choose a smaller photo." }, { status: 413 });
      }

      photo = { name: photoName, mimeType, base64 };
    }

    let photoKey: string | null = null;
    if (photo) {
      if (!hasReviewR2Config()) {
        return NextResponse.json({ ok: false, error: "Photo storage is not configured." }, { status: 503 });
      }

      photoKey = `review-photos/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.jpg`;
      await putPrivateReviewR2Object({
        key: photoKey,
        body: Buffer.from(photo.base64, "base64"),
        contentType: "image/jpeg",
      });
    }

    try {
      const reviewId = await saveCustomerReview({
        rating,
        reviewText,
        templateId,
        photoName: photo?.name ?? null,
        photoKey,
        photoMimeType: photo?.mimeType ?? null,
      });

      return NextResponse.json({ ok: true, reviewId });
    } catch (error) {
      if (photoKey) {
        try {
          await deletePrivateReviewR2Object(photoKey);
        } catch (cleanupError) {
          console.error("Review photo cleanup failed", cleanupError instanceof Error ? cleanupError.message : "Unknown R2 cleanup error");
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Review save failed", error instanceof Error ? error.message : "Unknown review save error");
    return NextResponse.json(
      { ok: false, error: "We could not save your feedback. Please try again." },
      { status: 500 },
    );
  }
}

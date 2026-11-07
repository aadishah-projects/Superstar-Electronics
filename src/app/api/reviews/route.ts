import { NextResponse } from "next/server";

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
  const endpoint = process.env.REVIEW_UPLOAD_URL;

  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "Review upload is not configured." }, { status: 503 });
  }

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

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: new URLSearchParams({
        payload: JSON.stringify({ rating, reviewText, templateId, photo }),
      }),
      cache: "no-store",
      redirect: "follow",
    });

    const upstreamText = await upstream.text();
    let upstreamResult: { ok?: boolean; error?: string } = {};

    try {
      upstreamResult = JSON.parse(upstreamText) as { ok?: boolean; error?: string };
    } catch {
      upstreamResult = { ok: false, error: "Google Apps Script returned an unexpected response." };
    }

    if (!upstream.ok || upstreamResult.ok !== true) {
      return NextResponse.json(
        { ok: false, error: upstreamResult.error || "We could not save your feedback." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "We could not save your feedback." },
      { status: 500 },
    );
  }
}

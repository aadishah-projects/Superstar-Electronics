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

const redirectStatuses = new Set([301, 302, 303, 307, 308]);

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function resolveRedirectUrl(location: string, endpoint: string) {
  try {
    const url = new URL(location, endpoint);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchAppsScriptResponse(endpoint: string, body: string) {
  const initialResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body,
    cache: "no-store",
    redirect: "manual",
  });

  if (!redirectStatuses.has(initialResponse.status)) {
    return {
      status: initialResponse.status,
      contentType: initialResponse.headers.get("content-type") || "",
      text: await initialResponse.text(),
      responseLostAfterRedirect: false,
    };
  }

  let location = initialResponse.headers.get("location");
  if (!location) {
    return { status: initialResponse.status, contentType: "", text: "", responseLostAfterRedirect: false };
  }

  const firstRedirectUrl = resolveRedirectUrl(location, endpoint);
  if (!firstRedirectUrl) {
    return { status: initialResponse.status, contentType: "", text: "", responseLostAfterRedirect: false };
  }

  let lastResponse = initialResponse;
  let lastText = "";

  // Apps Script ContentService can briefly return 404 while its one-time
  // googleusercontent.com response URL is being made available. Retry the
  // response URL only; never repeat the POST, which could create duplicates.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) await wait(attempt * 1500);

    const responseUrl = resolveRedirectUrl(location, endpoint);
    if (!responseUrl) break;
    lastResponse = await fetch(responseUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "manual",
    });
    lastText = await lastResponse.text();

    if (!redirectStatuses.has(lastResponse.status)) break;

    const nextLocation = lastResponse.headers.get("location");
    if (!nextLocation) break;
    location = nextLocation;
  }

  return {
    status: lastResponse.status,
    contentType: lastResponse.headers.get("content-type") || "",
    text: lastText,
    responseLostAfterRedirect: new URL(firstRedirectUrl).hostname === "script.googleusercontent.com" && lastResponse.status === 404,
  };
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

    const upstream = await fetchAppsScriptResponse(
      endpoint,
      new URLSearchParams({
        payload: JSON.stringify({ rating, reviewText, templateId, photo }),
      }).toString(),
    );

    const upstreamText = upstream.text;
    let upstreamResult: { ok?: boolean; error?: string } = {};

    try {
      upstreamResult = JSON.parse(upstreamText) as { ok?: boolean; error?: string };
    } catch {
      upstreamResult = { ok: false, error: "Google Apps Script returned an unexpected response." };
    }

    if (upstream.responseLostAfterRedirect) {
      console.warn("Apps Script accepted the review, but its one-time response URL returned 404; continuing without repeating the POST.");
      return NextResponse.json({ ok: true, responseUnconfirmed: true });
    }

    if (upstream.status < 200 || upstream.status >= 300 || upstreamResult.ok !== true) {
      console.error("Review upload failed", {
        status: upstream.status,
        contentType: upstream.contentType,
        error: upstreamResult.error || "Google Apps Script returned an unsuccessful response.",
      });
      return NextResponse.json(
        { ok: false, error: upstreamResult.error || `Google Apps Script returned HTTP ${upstream.status}.` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Review upload request failed", error instanceof Error ? error.message : "Unknown review upload error");
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "We could not save your feedback." },
      { status: 500 },
    );
  }
}

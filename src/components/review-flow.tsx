"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { siteConfig } from "@/data/site";

const ratingLabels: Record<number, string> = {
  1: "Not great",
  2: "Could be better",
  3: "It was okay",
  4: "Really good",
  5: "Excellent",
};

type ReviewOption = {
  id: string;
  label: string;
  phrase: string;
};

const reviewOptionsByRating: Record<number, ReviewOption[]> = {
  1: [
    { id: "disappointing", label: "Disappointing experience", phrase: "some disappointing parts" },
    { id: "slow-service", label: "Slower than expected", phrase: "slower service than expected" },
    { id: "needs-follow-up", label: "Needs follow-up", phrase: "better follow-up" },
    { id: "needs-improvement", label: "Needs improvement", phrase: "room for improvement" },
  ],
  2: [
    { id: "average-service", label: "Average service", phrase: "an average overall experience" },
    { id: "some-delays", label: "Some delays", phrase: "some delays" },
    { id: "clearer-communication", label: "Clearer communication", phrase: "clearer communication" },
    { id: "needs-follow-up", label: "Needs follow-up", phrase: "better follow-up" },
    { id: "needs-improvement", label: "Needs improvement", phrase: "room for improvement" },
  ],
  3: [
    { id: "okay-service", label: "Okay service", phrase: "an okay overall experience" },
    { id: "could-be-faster", label: "Could be faster", phrase: "faster service" },
    { id: "helpful-team", label: "Helpful team", phrase: "a helpful team" },
    { id: "clearer-communication", label: "Clearer communication", phrase: "clearer communication" },
    { id: "room-to-improve", label: "Room to improve", phrase: "some areas that could be improved" },
  ],
  4: [
    { id: "good-service", label: "Good service", phrase: "good service" },
    { id: "good-timing", label: "Good timing", phrase: "good timing" },
    { id: "helpful-team", label: "Helpful team", phrase: "a helpful team" },
    { id: "clear-explanation", label: "Clear explanation", phrase: "clear explanations" },
    { id: "good-value", label: "Good value", phrase: "good value" },
    { id: "smooth-experience", label: "Smooth experience", phrase: "a smooth experience" },
  ],
  5: [
    { id: "good-service", label: "Good service", phrase: "good service" },
    { id: "good-timing", label: "Good timing", phrase: "good timing" },
    { id: "helpful-team", label: "Helpful team", phrase: "a helpful team" },
    { id: "clear-explanation", label: "Clear explanation", phrase: "clear explanations" },
    { id: "neat-work", label: "Neat work", phrase: "neat work" },
    { id: "good-products", label: "Good products", phrase: "good product quality" },
    { id: "quick-response", label: "Quick response", phrase: "a quick response" },
    { id: "fair-pricing", label: "Fair pricing", phrase: "fair pricing" },
    { id: "good-follow-up", label: "Good follow-up", phrase: "good follow-up" },
    { id: "smooth-experience", label: "Smooth experience", phrase: "a smooth experience" },
  ],
};

function joinPhrases(phrases: string[]) {
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`;
  return `${phrases.slice(0, -1).join(", ")}, and ${phrases[phrases.length - 1]}`;
}

function buildReviewText(rating: number, options: ReviewOption[]) {
  const phrases = joinPhrases(options.map((option) => option.phrase));

  if (rating >= 4) {
    return `We had ${phrases} with Super Star Electronics. The team was helpful, professional, and easy to work with.`;
  }

  if (rating === 3) {
    return `The experience was okay. We noticed ${phrases}. There is some room to improve.`;
  }

  return `Our experience was not what we expected. We noticed ${phrases}. We hope the team can improve.`;
}

const GOOGLE_BUSINESS_URL = "https://g.page/r/CZASJStIzwKxEBM/review";

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.split(",")[1];
      if (base64) resolve(base64);
      else reject(new Error("We could not read the selected photo."));
    };
    reader.onerror = () => reject(new Error("We could not read the selected photo."));
    reader.readAsDataURL(file);
  });
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m21 15-4.2-4.2L7 20" />
    </svg>
  );
}

export function ReviewFlow() {
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [rating, setRating] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [photoConsent, setPhotoConsent] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [flowError, setFlowError] = useState("");
  const [copied, setCopied] = useState(false);
  const [googleBlocked, setGoogleBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const options = rating ? reviewOptionsByRating[rating] : [];
  const selectedOptions = options.filter((option) => selectedOptionIds.includes(option.id));
  const reviewText = selectedOptions.length ? buildReviewText(rating, selectedOptions) : "";
  const ratingLabel = rating ? ratingLabels[rating] : "Choose a rating";

  const progress = useMemo(() => {
    return [Boolean(rating), Boolean(rating && selectedOptionIds.length), Boolean(rating && selectedOptionIds.length)];
  }, [rating, selectedOptionIds.length]);

  function handleRatingChange(value: number) {
    setRating(value);
    setSelectedOptionIds([]);
    setFlowError("");
    setCopied(false);
    setSaved(false);
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Please choose an image smaller than 5 MB.");
      return;
    }

    setPhotoError("");
    setPhotoFile(file);
    setPhotoName(file.name);
    setPhotoConsent(false);
    setPhotoPreview(URL.createObjectURL(file));
    setFlowError("");
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoName("");
    setPhotoConsent(false);
    setPhotoError("");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function handleContinue() {
    if (!rating || !selectedOptions.length) {
      setFlowError("Choose a rating and at least one phrase to continue.");
      return;
    }

    if (photoFile && !photoConsent) {
      setFlowError("Please confirm that you want to share the photo with Super Star Electronics.");
      return;
    }

    setFlowError("");
    setGoogleBlocked(false);
    setSaving(true);

    try {
      if (!saved) {
        const photo = photoFile
          ? {
              name: photoFile.name,
              mimeType: photoFile.type,
              base64: await fileToBase64(photoFile),
            }
          : null;
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, templateId: selectedOptionIds.join(","), reviewText, photo }),
        });
        const result = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || result.ok !== true) {
          throw new Error(result.error || "We could not save your feedback.");
        }
        setSaved(true);
      }

      await copyToClipboard(reviewText);
      setCopied(true);
    } catch {
      setCopied(false);
      setFlowError("We could not save your feedback. Please try again.");
      setSaving(false);
      return;
    }

    const googleWindow = window.open(GOOGLE_BUSINESS_URL, "_blank", "noopener,noreferrer");
    if (!googleWindow) setGoogleBlocked(true);
    setSaving(false);
  }

  return (
    <section className="relative overflow-hidden bg-[#f5f8fc] py-8 sm:py-12 lg:py-16">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#dceaff] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#ffe4e2] blur-3xl" />

      <div className="relative mx-auto w-full max-w-[74rem] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-kicker">Customer feedback</span>
          <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-5xl">How did we do?</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 copy-muted sm:text-base sm:leading-8">
            Your experience helps the next family, shop, or office choose with confidence. This takes less than a minute.
          </p>

          <div className="mx-auto mt-7 flex max-w-xl items-center justify-center gap-2 text-[0.63rem] font-semibold uppercase tracking-[0.12em] text-[#71829a] sm:gap-3 sm:text-[0.68rem] sm:tracking-[0.16em]">
            {["Rate", "Choose", "Share"].map((label, index) => (
              <div key={label} className="flex min-w-0 items-center gap-2 sm:gap-3">
                <span className={progress[index] || (index === 0 && rating === 0) ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#173f70] text-white" : "flex h-7 w-7 items-center justify-center rounded-full border border-[#d6e0ec] bg-white text-[#8291a6]"}>
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
                {index < 2 ? <span className="h-px w-8 bg-[#d8e2ee] sm:w-14" /> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-9 grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="surface-card-strong overflow-hidden p-5 sm:p-8">
            <div className="flex items-start gap-3 border-b border-[#e6edf5] pb-5 sm:gap-4 sm:pb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9f1ff] text-sm font-bold text-[#1463d7]">01</span>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#71829a]">Start here</p>
                <h2 className="mt-1 text-lg font-semibold text-ink sm:text-xl">How would you rate your experience?</h2>
              </div>
            </div>

            <div className="pt-6">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3" role="radiogroup" aria-label="Rate your experience">
                {[1, 2, 3, 4, 5].map((value) => {
                  const selected = rating === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={`${value} out of 5 stars — ${ratingLabels[value]}`}
                      onClick={() => handleRatingChange(value)}
                      className={`group flex min-w-[3.25rem] flex-col items-center gap-1 rounded-2xl border px-2.5 py-2.5 transition hover:-translate-y-0.5 sm:min-w-[4.15rem] sm:px-3.5 sm:py-3 ${selected ? "border-[#c82b2b] bg-[#fff4f3] text-[#c82b2b] shadow-[0_8px_24px_rgba(200,43,43,0.12)]" : "border-[#e1e8f0] bg-white text-[#c5cfdb] hover:border-[#f2b0ab] hover:text-[#e58b84]"}`}
                    >
                      <StarIcon filled={selected} />
                      <span className={`text-[0.62rem] font-semibold ${selected ? "text-[#a51f1f]" : "text-[#7a8ba1]"}`}>{value === 5 ? "5 stars" : value}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-[#173f70]" aria-live="polite">{ratingLabel}</p>
            </div>

            {rating ? (
              <div className="mt-8 border-t border-[#e6edf5] pt-7">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1ef] text-sm font-bold text-[#c82b2b]">02</span>
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#71829a]">No typing needed</p>
                    <h2 className="mt-1 text-lg font-semibold text-ink sm:text-xl">Pick up to 3 things that match</h2>
                    <p className="mt-1.5 text-sm leading-6 copy-muted">Choose a few simple phrases that reflect your experience. We’ll combine them into a review for you.</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5" role="group" aria-label="Choose review details">
                  {options.map((option) => {
                    const selected = selectedOptionIds.includes(option.id);
                    const limitReached = selectedOptionIds.length >= 3 && !selected;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        aria-disabled={limitReached}
                        onClick={() => {
                          if (limitReached) return;
                          setSelectedOptionIds((current) => selected ? current.filter((id) => id !== option.id) : [...current, option.id]);
                          setFlowError("");
                          setCopied(false);
                          setSaved(false);
                        }}
                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-semibold transition ${selected ? "border-[#173f70] bg-[#173f70] text-white shadow-[0_8px_20px_rgba(23,63,112,0.14)]" : limitReached ? "cursor-not-allowed border-[#e7edf3] bg-[#f8fafc] text-[#b4bfcc]" : "border-[#dce6f0] bg-white text-[#334b68] hover:-translate-y-0.5 hover:border-[#8eb3e1]"}`}
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[0.7rem] ${selected ? "border-white text-white" : "border-[#cbd8e7] text-transparent"}`} aria-hidden="true">✓</span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {reviewText ? (
                  <div className="mt-5 rounded-2xl border border-[#dbe7f2] bg-[#f8fbff] p-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#71829a]">Your review will say</p>
                    <p className="mt-2 text-sm leading-6 text-[#405873]">{reviewText}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-[#d6e1ee] bg-[#f8fbff] px-4 py-5 text-center text-sm leading-6 text-[#6d7f96] sm:px-6">
                Pick a star rating above to see ready-to-use review options.
              </div>
            )}

            <div className="mt-8 border-t border-[#e6edf5] pt-7">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf8f7] text-sm font-bold text-[#0b9b9a]">03</span>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#71829a]">Optional</p>
                  <h2 className="mt-1 text-lg font-semibold text-ink sm:text-xl">Add a photo of your setup</h2>
                  <p className="mt-1.5 text-sm leading-6 copy-muted">We’ll also save this photo in our private review folder. We’d really appreciate it if you attach the same photo again on Google so your public review includes your setup.</p>
                </div>
              </div>

              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
              {photoPreview ? (
                <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#dfe8f1] bg-[#fbfdff] p-3">
                  <Image src={photoPreview} alt="Selected setup preview" width={80} height={80} unoptimized className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#334b68]">{photoName}</p>
                    <p className="mt-1 text-xs text-[#71829a]">Ready to save privately and attach on Google</p>
                  </div>
                  <button type="button" onClick={removePhoto} className="rounded-lg px-2 py-1 text-xs font-semibold text-[#c82b2b] hover:bg-[#fff1ef]">Remove</button>
                </div>
              ) : (
                <button type="button" onClick={() => photoInputRef.current?.click()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b9cbe1] bg-[#f8fbff] px-4 py-4 text-sm font-semibold text-[#315887] transition hover:border-[#1463d7] hover:bg-[#f1f6fd]">
                  <ImageIcon />
                  Add a photo
                </button>
              )}
              {photoFile ? (
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e3ebf4] bg-[#fbfdff] p-3 text-xs leading-5 text-[#5f728b]">
                  <input type="checkbox" checked={photoConsent} onChange={(event) => setPhotoConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#173f70]" />
                  <span>I agree to share this photo with Super Star Electronics for our private feedback records, and I’m happy to attach it again on Google.</span>
                </label>
              ) : null}
              {photoError ? <p className="mt-2 text-xs font-semibold text-[#c82b2b]">{photoError}</p> : null}
            </div>

            <div className="mt-8 rounded-2xl bg-[#173f70] p-4 text-white sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg text-[#ffca4b]">★</span>
                <div>
                  <p className="text-sm font-semibold">Almost there</p>
                  <p className="mt-1 text-xs leading-5 text-white/75">We’ll save your feedback to our private records, copy your review automatically, and open Google. Paste the copied text there, attach the same photo again, and submit.</p>
                </div>
              </div>

              <button type="button" onClick={handleContinue} disabled={saving} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173f70] transition hover:-translate-y-0.5 hover:bg-[#f3f7fb] disabled:cursor-wait disabled:opacity-70">
                {saving ? "Saving your feedback…" : copied ? "Review copied — continue to Google" : "Continue to Google"}
                <ArrowUpRightIcon />
              </button>
              {flowError ? <p className="mt-3 text-center text-xs font-semibold text-[#ffd4d0]">{flowError}</p> : null}
              {googleBlocked ? <p className="mt-3 text-center text-xs leading-5 text-white/80">Your browser blocked the new tab. <a href={GOOGLE_BUSINESS_URL} target="_blank" rel="noreferrer" className="font-bold underline">Open Google manually</a>.</p> : null}
              {copied ? <p className="mt-3 text-center text-xs leading-5 text-[#c9f1e8]">Your review is copied. On Google, tap the review box and choose Paste, then attach the same photo.</p> : null}
            </div>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-[#173f70] p-5 text-white shadow-[0_16px_36px_rgba(23,63,112,0.18)] sm:p-6">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#b9d4ff]">Why your review matters</p>
              <p className="mt-3 text-lg font-semibold leading-7">It helps local customers find a team they can trust.</p>
              <div className="mt-5 space-y-3 border-t border-white/15 pt-4 text-sm leading-6 text-white/75">
                <p>✓ Helps families compare real service experiences</p>
                <p>✓ Helps us improve our installation and support</p>
                <p>✓ Takes about 30 seconds on Google</p>
              </div>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#71829a]">Need help first?</p>
              <p className="mt-2 text-sm leading-6 text-[#4c6078]">If something needs attention, message our team before leaving your review.</p>
              <a href={`https://wa.me/${siteConfig.contact.whatsapp}`} target="_blank" rel="noreferrer" className="action-whatsapp mt-4 w-full">Message us on WhatsApp</a>
            </div>

            <div className="rounded-2xl border border-[#e1e8f0] bg-white/70 p-5 text-xs leading-5 text-[#71829a]">
              <p className="font-semibold text-[#4c6078]">A quick note about Google</p>
              <p className="mt-1">Google requires customers to paste and submit their own review. We cannot publish it or upload the photo for you.</p>
            </div>
          </aside>
        </div>

        <p className="mx-auto mt-7 max-w-xl text-center text-xs leading-5 text-[#8796a8]">Super Star Electronics Industries · Ganesh Market, Narayangarh, Chitwan</p>
      </div>
    </section>
  );
}

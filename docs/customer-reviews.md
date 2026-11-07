# Customer review flow

The customer review page is available at `/review` and is intended to be shared as one simple WhatsApp link:

```text
https://superstarelectronics.com.np/review
```

## Customer experience

1. The customer selects a star rating.
2. They choose up to three short phrases that match their experience, such as `Good service`, `Good timing`, or `Helpful team`.
3. The page combines those choices into a review draft.
4. The customer can add a setup photo. With consent, the photo is saved to the private R2 bucket and the customer is asked to attach the same photo again on Google.
5. The page saves the rating, review text, and photo reference to the review backend, copies the review text, and opens the direct Google review page.
6. The customer pastes the copied text, attaches the photo, and submits the review on Google. Google submission remains a customer action.

The page supports general templates only. No service-specific query links are required.

## Storage architecture

```text
Review page
  -> POST /api/reviews
  -> Private Cloudflare R2: uploaded customer photo
  -> Google Apps Script web app
     -> Google Sheet: rating, review text, photo name/R2 object key
```

The R2 bucket should remain private. Customers do not need access to it. The server uploads the compressed photo using the existing R2 credentials, while Apps Script records the review row and R2 object key in the Sheet.

Before sending a photo to the server, the review page resizes and compresses it in the customer's browser so normal phone-camera images stay within the hosting request-size limit.

The Next.js review endpoint follows Apps Script ContentService redirects manually. If Google briefly returns a 404 for the one-time `googleusercontent.com` response URL, the endpoint retries that response URL without repeating the original POST. This avoids duplicate Sheet rows when the Apps Script execution has already completed.

## Environment variable

The Next.js server forwards submissions to Apps Script using:

```env
REVIEW_UPLOAD_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Keep the real value in `.env.local` for local development and in the Vercel production environment. The committed `.env.example` contains only a placeholder.

Review photos use the separate private R2 configuration `REVIEW_R2_BUCKET_NAME`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID_2`, and `R2_SECRET_ACCESS_KEY_2`. The existing unsuffixed R2 variables remain reserved for portal attachments.

## Apps Script contract

The Apps Script deployment must be a Web app configured to execute as the owner and allow anonymous access, because customers do not sign in. It should expose `doGet` for a health check and `doPost` for submissions.

The website sends a URL-encoded `payload` field containing JSON with this shape:

```json
{
  "rating": 5,
  "templateId": "good-service,good-timing",
  "reviewText": "We had good service and good timing with Super Star Electronics. The team was helpful, professional, and easy to work with.",
  "photo": {
    "name": "review-photos/2026-11-07/example.jpg",
    "mimeType": "image/jpeg",
    "base64": "",
    "r2Key": "review-photos/2026-11-07/example.jpg"
  }
}
```

The Apps Script should validate the rating and append the submission to the `Reviews` sheet. The empty `photo.base64` deliberately skips the old Drive upload branch; `photo.name` records the private R2 object key.

## Testing

Use `/review` for the public flow. A real test submission will create a row in the Sheet and an object in R2, so do not use fake submissions unless you intend to remove them afterward.

Before changing the Apps Script contract, update both the Apps Script project and `src/app/api/reviews/route.ts` together.

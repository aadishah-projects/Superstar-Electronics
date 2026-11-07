# Customer review flow

The customer review page is available at `/review` and is intended to be shared as one simple WhatsApp link:

```text
https://superstarelectronics.com.np/review
```

## Customer experience

1. The customer selects a star rating.
2. They choose up to three short phrases that match their experience, such as `Good service`, `Good timing`, or `Helpful team`.
3. The page combines those choices into a review draft.
4. The customer can add a setup photo. With consent, the photo is saved to the private Drive folder and the customer is asked to attach the same photo again on Google.
5. The page saves the rating, review text, and photo reference to the review backend, copies the review text, and opens the direct Google review page.
6. The customer pastes the copied text, attaches the photo, and submits the review on Google. Google submission remains a customer action.

The page supports general templates only. No service-specific query links are required.

## Storage architecture

```text
Review page
  -> POST /api/reviews
  -> Google Apps Script web app
     -> Google Sheet: rating, review text, photo name, Drive file ID
     -> Google Drive: uploaded customer photo
```

The Drive folder should remain **Restricted**. Customers do not need access to it. The Apps Script web app runs as the business owner and writes to Drive and Sheets using that account's permissions.

The Next.js review endpoint follows Apps Script ContentService redirects manually. If Google briefly returns a 404 for the one-time `googleusercontent.com` response URL, the endpoint retries that response URL without repeating the original POST. This avoids duplicate Sheet rows or Drive files when the Apps Script execution has already completed.

## Environment variable

The Next.js server forwards submissions to Apps Script using:

```env
REVIEW_UPLOAD_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Keep the real value in `.env.local` for local development and in the Vercel production environment. The committed `.env.example` contains only a placeholder.

## Apps Script contract

The Apps Script deployment must be a Web app configured to execute as the owner and allow anonymous access, because customers do not sign in. It should expose `doGet` for a health check and `doPost` for submissions.

The website sends a URL-encoded `payload` field containing JSON with this shape:

```json
{
  "rating": 5,
  "templateId": "good-service,good-timing",
  "reviewText": "We had good service and good timing with Super Star Electronics. The team was helpful, professional, and easy to work with.",
  "photo": {
    "name": "setup.jpg",
    "mimeType": "image/jpeg",
    "base64": "..."
  }
}
```

The Apps Script should validate the rating and image type/size, create the Drive file from the decoded image blob, and append the submission to the `Reviews` sheet.

## Testing

Use `/review` for the public flow. A real test submission will create a row in the Sheet and a file in Drive, so do not use fake submissions unless you intend to remove them afterward.

Before changing the Apps Script contract, update both the Apps Script project and `src/app/api/reviews/route.ts` together.

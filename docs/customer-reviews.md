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
5. The page saves the rating, review text, and photo reference to the private review backend, copies the review text, and opens the direct Google review page.
6. The customer pastes the copied text, attaches the photo, and submits the review on Google. Google submission remains a customer action.

The page supports general templates only. No service-specific query links are required.

## Storage architecture

```text
Review page
  -> POST /api/reviews
  -> Private Cloudflare R2: uploaded customer photo
  -> Firebase Firestore: rating, review text, photo name/R2 object key
```

The R2 bucket should remain private. Customers do not need access to it. The server uploads the compressed photo to R2 and saves the review record in the existing Firebase Firestore project. Google Apps Script and Google Sheets are not part of the live submission path.

Before sending a photo to the server, the review page resizes and compresses it in the customer's browser so normal phone-camera images stay within the hosting request-size limit.

## Storage configuration

Review photos use the separate private R2 configuration `REVIEW_R2_BUCKET_NAME`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID_2`, and `R2_SECRET_ACCESS_KEY_2`. The existing unsuffixed R2 variables remain reserved for portal attachments. Review records use the existing Firebase Admin credentials and the `customer_reviews` Firestore collection.

The review endpoint does not use `REVIEW_UPLOAD_URL`, Google Apps Script, Google Drive, or Google Sheets. The R2 credentials are server-only and must never be exposed in client-side code.

## Firestore record

Each submission creates one document in `customer_reviews` with the rating, generated review text, selected template IDs, creation time, and—when supplied—the private R2 object key and original photo name.

## R2 object layout

Review photos are stored privately under:

```text
review-photos/YYYY-MM-DD/<random-id>.jpg
```

Customers do not receive access to these objects. They upload the same photo separately to Google when submitting the public review.

## Testing

Use `/review` for the public flow. A real test submission will create a Firestore document and an object in R2, so do not use fake submissions unless you intend to remove them afterward.

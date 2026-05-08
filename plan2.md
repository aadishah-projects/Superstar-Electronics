# Super Star Electronics Industries Website v1

## Summary

Build a static `Next.js + TypeScript + Tailwind` website for Vercel with 5 pages: `/`, `/products`, `/services`, `/about`, and `/contact`. The site is a lead-generation website, not ecommerce: no accounts, no cart, no payments, no admin, and no database.

Use the UI palette from `color-pallete.md` and `color-pallete.png`:
`#FFFFFF`, `#212121`, `#1C3C6E`, `#C82B2B`, `#E8EEF8`.
Use the rainbow logo suite from `logo.png` as the brand mark per your choice, while keeping the page chrome and CTAs blue/red so the interface still feels professional and security-focused.

## Key Changes

- Scaffold a new App Router project with shared layout, responsive header/footer, and minimal client-side JS.
- Define brand tokens as CSS variables and use a deliberate visual system:
  `Space Grotesk` for headings, `Manrope` for body, soft light gradients, subtle grid/pattern backgrounds, and restrained reveal animations.
- Split `logo.png` into usable assets for implementation:
  header uses the horizontal logo, favicon uses the icon-only/fav variant, and the original sheet stays as a reference asset.
- Store all editable business content in local data modules such as `data/site.ts` and `data/catalog.ts`; no CMS or backend.

### Page behavior

- Home:
  hero with `View Products`, `WhatsApp Us`, and `Call Now`; brand strip; product-category preview; services preview; “Why Choose Us”; and a quote/request CTA section.
- Products:
  category-based catalog only, using the profile categories instead of fake SKU listings.
  Each card shows category name, short use-case/spec text, supported brands, and a WhatsApp inquiry button.
- Services:
  CCTV installation, security setup, wholesale/retail supply, repair/maintenance, networking support, and consultation.
  Include simple solution cards for homes, offices, and shops with `Request Quote` CTAs.
- About:
  company overview, owner/business identity, service area across Nepal, warranty/support, working hours, and trusted-brand positioning.
- Contact:
  primary call button for `9855026835`, WhatsApp button for `9845048635`, email link to `suvashshah251@gmail.com`, full address, hours, and a Google Maps deep link card.

### Shared site features

- Floating mobile-first WhatsApp and call actions on all pages.
- Reusable CTA helper that generates prefilled WhatsApp messages by context:
  general inquiry, product category inquiry, service inquiry, and quotation request.
- Per-page SEO metadata focused on Chitwan/Nepal CCTV and security keywords.
- `Organization` / `LocalBusiness` structured data on the homepage and contact page.
- No stock-photo dependency: use abstract tech/security backgrounds and brand-led layouts instead of fake installation imagery.

## Public Interfaces / Types

Add a small typed content layer for predictable rendering:

- `SiteConfig`
- `BrandItem`
- `ProductCategory`
- `ServiceItem`
- `ContactMethod`
- `InquiryContext`

Add fixed route interfaces for:

- `/`
- `/products`
- `/services`
- `/about`
- `/contact`

## Test Plan

- Run `npm run lint` and `npm run build`.
- Verify responsive layouts at mobile, tablet, and desktop widths.
- Verify all CTAs:
  call link, WhatsApp deep links with correct prefilled text, email link, and Maps link.
- Verify header/footer navigation, active states, and no dead routes.
- Verify metadata, page titles, descriptions, and JSON-LD output.
- Verify logo rendering in header/footer plus favicon visibility.
- Verify color contrast and keyboard accessibility for nav and CTAs.

## Assumptions And Defaults

- English-only copy for v1.
- Inquiry-only product experience: no public pricing, checkout, or inventory.
- No gallery and no testimonials in v1 because no real photos or approved quotes were provided.
- Contact uses direct actions instead of a submitted form because the site has no backend.
- The selected hybrid branding is intentional for v1:
  rainbow `logo.png` assets for the logo, blue/red corporate palette for the UI.

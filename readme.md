**Run It**

In the project folder, use:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

For a production-style test:

```bash
npm run build
npm run start
```

Useful scripts are in [package.json](<c:/Users/Acer/Downloads/Simple Website/package.json:1>).  
Stop the server with `Ctrl + C`.

**Add Items**

Most company content still lives in [src/data/site.ts](<c:/Users/Acer/Downloads/Simple Website/src/data/site.ts:1>).

Actual product catalog data now comes from:

- [src/data/quality-products.json](<c:/Users/Acer/Downloads/Simple Website/src/data/quality-products.json:1>)
- [src/data/catalog.ts](<c:/Users/Acer/Downloads/Simple Website/src/data/catalog.ts:1>)
- [scripts/scrape_quality_products.py](<c:/Users/Acer/Downloads/Simple Website/scripts/scrape_quality_products.py:1>)

To refresh the product catalog from `qualitycomputer.com.np`, run:

```bash
npm run sync:catalog
```

That rewrites `src/data/quality-products.json` with the latest scraped products.

Edit these sections there:

- `siteConfig`: company name, phones, email, hours, address
- `brands`: add or remove brand names
- `productCategories`: update the category preview content still shown on the homepage
- `services`: add service cards
- `solutionPackages`: add quote/package cards
- `whyChooseUs`: short trust points
- `contactMethods`: contact blocks on `/contact`

If you want to change how scraped products are categorized or how many products are pulled per section, edit the `CATEGORY_CONFIGS` list in [scripts/scrape_quality_products.py](<c:/Users/Acer/Downloads/Simple Website/scripts/scrape_quality_products.py:1>) and run `npm run sync:catalog` again.

Example: add a new service inside `services`:

```ts
{
  slug: "attendance-setup",
  name: "Attendance System Setup",
  summary:
    "Setup and support for biometric attendance and access systems.",
  highlights: ["Installation", "User setup", "Basic training"],
  icon: "shield",
  inquiryLabel: "attendance system setup",
}
```

Each product card now opens WhatsApp with a product-specific message, including the exact product name, model, and reference price.

**Improve Design**

The fastest design changes are in [src/app/globals.css](<c:/Users/Acer/Downloads/Simple Website/src/app/globals.css:1>). That file controls:

- colors: `--brand-blue`, `--brand-red`, `--surface`
- buttons: `.action-primary`, `.action-secondary`, `.action-accent`
- cards: `.surface-card`, `.surface-card-strong`
- background: the `body` gradient and `.subtle-pattern`

Layout/content styling is in the page files:

- home: [src/app/page.tsx](<c:/Users/Acer/Downloads/Simple Website/src/app/page.tsx:1>)
- products: [src/app/products/page.tsx](<c:/Users/Acer/Downloads/Simple Website/src/app/products/page.tsx:1>)
- services: [src/app/services/page.tsx](<c:/Users/Acer/Downloads/Simple Website/src/app/services/page.tsx:1>)
- about: [src/app/about/page.tsx](<c:/Users/Acer/Downloads/Simple Website/src/app/about/page.tsx:1>)
- contact: [src/app/contact/page.tsx](<c:/Users/Acer/Downloads/Simple Website/src/app/contact/page.tsx:1>)

Best next design upgrades:
- Add real installation/gallery images in `public/` and show them on home/about.
- Replace text-only brand boxes with real brand logos.
- Add testimonials from real customers.
- Add a more visual hero with a product/install photo collage.
- Add a dedicated “Packages” section on the home page.
- Refine header/footer spacing and make CTAs slightly larger on mobile.

If you want, I can next do one of these for you:
1. add real product items,
2. improve the homepage design,
3. add gallery/testimonials,
4. prepare it for deployment.

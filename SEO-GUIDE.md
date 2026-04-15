# SEO Guide — Saqib Watches

## 1. Meta Tags (Already Configured)

The root `layout.js` includes:

- **Title template**: Per-page titles via `metadata.title` in each `page.js`
- **Open Graph**: Full OG tags with image, title, description
- **Twitter Card**: `summary_large_image` for rich previews
- **Keywords**: Relevant luxury watch keywords for Pakistan
- **Robots**: `index, follow` enabled

### Adding Per-Page Metadata

In any `page.js`, export a `metadata` object:

```js
export const metadata = {
  title: "Gallery", // Renders as "Gallery | Saqib Watches"
  description: "Browse our complete collection of luxury watches.",
};
```

For dynamic pages (product detail), use `generateMetadata`:

```js
export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.id);
  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: {
      images: [{ url: product.imageUrl }],
    },
  };
}
```

---

## 2. OG Image

Place a `1200×630px` image at `/public/og-image.jpg`.

Recommended content:
- Brand logo "Saqib Watches"
- Tagline "Precious in Your Wrist"
- A hero watch image
- Dark background with gold (#c9a96e) accents

---

## 3. Structured Data (JSON-LD)

Add JSON-LD to product pages for rich Google results:

```js
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  image: product.imageUrl,
  description: product.description,
  brand: { "@type": "Brand", name: "Saqib Watches" },
  offers: {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "PKR",
    availability: "https://schema.org/InStock",
  },
};
```

Add to the page via:
```jsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

---

## 4. Sitemap

Create `app/sitemap.js`:

```js
export default async function sitemap() {
  const products = await fetchAllProducts();
  const productUrls = products.map((p) => ({
    url: `https://lahza.watch/product/${p.id}`,
    lastModified: p.updatedAt || new Date(),
  }));

  return [
    { url: "https://lahza.watch", lastModified: new Date() },
    { url: "https://lahza.watch/gallery", lastModified: new Date() },
    { url: "https://lahza.watch/about", lastModified: new Date() },
    { url: "https://lahza.watch/contact", lastModified: new Date() },
    ...productUrls,
  ];
}
```

---

## 5. robots.txt

Create `app/robots.js`:

```js
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: "https://lahza.watch/sitemap.xml",
  };
}
```

---

## 6. Image Optimization Checklist

- Use descriptive `alt` text on all `<img>` tags
- Compress images before uploading to Supabase (aim for < 200KB)
- Use WebP format when possible
- Main product images should be at least 800×1000px

---

## 7. Performance Tips

- Lazy-load below-the-fold images with `loading="lazy"`
- Minimize JavaScript bundles — use dynamic imports for heavy components
- Enable gzip/brotli compression on hosting
- Use Next.js `<Image>` component for automatic optimization (when using next/image)

---

## 8. Content Best Practices

- Write unique product descriptions (min 100 words)
- Include keywords naturally: "luxury watch", "men's watch Pakistan", etc.
- Use heading hierarchy: H1 for product name, H2 for sections
- Internal linking: link from product pages to related categories

---

## 9. Google Search Console

After deployment:
1. Verify domain at [search.google.com/search-console](https://search.google.com/search-console)
2. Submit sitemap URL
3. Monitor indexing status and fix any errors

---

## 10. Social Media Sharing

When sharing on WhatsApp/Facebook/Twitter, the OG tags will auto-generate rich previews. Ensure `og-image.jpg` is uploaded and accessible.

import { getProductByRouteSlug } from "@/lib/productSeo";
import { getProductHref } from "@/lib/productSlug";

const SITE_URL = "https://saqib.watch";
const SITE_NAME = "Saqib Watches";

function getAbsoluteUrl(path) {
  if (!path) {
    return `${SITE_URL}/og-image.jpg`;
  }

  if (String(path).startsWith("http")) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function getProductImage(product) {
  return (
    product?.imageUrl ||
    product?.images?.[0] ||
    product?.variants?.find((variant) => variant?.images?.length)?.images?.[0] ||
    "/og-image.jpg"
  );
}

function getProductDescription(product) {
  const cleanDescription = String(product?.description || "").replace(/\s+/g, " ").trim();
  if (cleanDescription) {
    return cleanDescription.slice(0, 160);
  }

  return `${product?.name} at Saqib Watches. Buy premium ${product?.category || "luxury"} watches online in Pakistan with COD and delivery support.`;
}

function getPrice(product) {
  const price = Number(product?.price);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductByRouteSlug(slug);

  if (!product) {
    return {
      title: "Watch Details",
      description: "Explore premium watches available at Saqib Watches.",
      robots: { index: false, follow: true },
      alternates: { canonical: "/gallery" },
    };
  }

  const title = `${product.name} - Buy Online in Pakistan`;
  const description = getProductDescription(product);
  const productPath = getProductHref(product);
  const imageUrl = getAbsoluteUrl(getProductImage(product));

  return {
    title,
    description,
    keywords: [
      product.name,
      `${product.name} price in Pakistan`,
      `${product.name} watch`,
      `${product.category || "luxury"} watches Pakistan`,
      "buy watches online Pakistan",
      "Saqib Watches",
    ].filter(Boolean),
    alternates: {
      canonical: productPath,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: productPath,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductLayout({ children, params }) {
  const { slug } = await params;
  const product = await getProductByRouteSlug(slug);
  const price = getPrice(product);

  const productStructuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: getProductDescription(product),
        image: [getAbsoluteUrl(getProductImage(product))],
        sku: product.model || product.id,
        brand: {
          "@type": "Brand",
          name: product.brand || product.name?.split(" ")?.slice(0, 2)?.join(" ") || SITE_NAME,
        },
        category: product.category,
        offers: price
          ? {
              "@type": "Offer",
              url: `${SITE_URL}${getProductHref(product)}`,
              priceCurrency: "PKR",
              price,
              availability: product.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
            }
          : undefined,
      }
    : null;

  return (
    <>
      {productStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
        />
      )}
      {children}
    </>
  );
}

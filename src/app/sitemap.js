
import { getAllProductsForSeo } from "@/lib/productSeo";
import { getProductHref } from "@/lib/productSlug";

export const dynamic = "force-dynamic";

function toDate(value) {
    if (!value) {
        return new Date();
    }

    if (typeof value?.toDate === "function") {
        return value.toDate();
    }

    if (typeof value?.seconds === "number") {
        return new Date(value.seconds * 1000);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function sitemap() {
    const baseUrl = "https://saqib.watch";
    const products = await getAllProductsForSeo();

    return [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
        { url: `${baseUrl}/gallery?category=men`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
        { url: `${baseUrl}/gallery?category=women`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
        { url: `${baseUrl}/gallery?category=couples`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
        { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        ...products.map((product) => ({
            url: `${baseUrl}${getProductHref(product)}`,
            lastModified: toDate(product.updatedAt || product.createdAt),
            changeFrequency: "weekly",
            priority: 0.85,
        })),
    ];
}

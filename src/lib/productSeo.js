import { cache } from "react";
import { productMatchesSlug, safeDecodeSlug } from "@/lib/productSlug";

const FIRESTORE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const FIRESTORE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const FIRESTORE_DATABASE_ID = "(default)";
const FIRESTORE_TIMEOUT_MS = 3500;
const MAX_PRODUCT_PAGES = 5;

function getFirestoreBaseUrl() {
  if (!FIRESTORE_API_KEY || !FIRESTORE_PROJECT_ID) {
    return null;
  }

  return `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents`;
}

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FIRESTORE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function readFirestoreValue(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;

  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(readFirestoreValue);
  }

  if ("mapValue" in value) {
    return readFirestoreFields(value.mapValue.fields || {});
  }

  return null;
}

function readFirestoreFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, readFirestoreValue(value)])
  );
}

function readFirestoreDocument(document) {
  if (!document?.name) {
    return null;
  }

  return {
    id: document.name.split("/").pop(),
    ...readFirestoreFields(document.fields || {}),
  };
}

export const getAllProductsForSeo = cache(async () => {
  const baseUrl = getFirestoreBaseUrl();
  if (!baseUrl) {
    return [];
  }

  const products = [];
  let pageToken = "";

  for (let page = 0; page < MAX_PRODUCT_PAGES; page += 1) {
    const pageTokenParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
    const payload = await fetchJsonWithTimeout(
      `${baseUrl}/products?pageSize=100${pageTokenParam}&key=${FIRESTORE_API_KEY}`
    );

    if (!payload?.documents?.length) {
      break;
    }

    products.push(...payload.documents.map(readFirestoreDocument).filter(Boolean));
    pageToken = payload.nextPageToken || "";

    if (!pageToken) {
      break;
    }
  }

  return products;
});

export const getProductByRouteSlug = cache(async (routeSlug) => {
  const baseUrl = getFirestoreBaseUrl();
  if (!baseUrl || !routeSlug) {
    return null;
  }

  const decodedSlug = safeDecodeSlug(routeSlug);

  if (decodedSlug && !decodedSlug.includes("/")) {
    const payload = await fetchJsonWithTimeout(
      `${baseUrl}/products/${encodeURIComponent(decodedSlug)}?key=${FIRESTORE_API_KEY}`
    );
    const directProduct = readFirestoreDocument(payload);

    if (directProduct) {
      return directProduct;
    }
  }

  const products = await getAllProductsForSeo();
  return products.find((product) => productMatchesSlug(product, decodedSlug)) || null;
});

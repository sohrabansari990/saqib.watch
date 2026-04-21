"use client";

const PRODUCT_STORAGE_KEY = "saqib_product_cache_v1";
const CATALOG_STORAGE_KEY = "saqib_catalog_cache_v1";
const MAX_PRODUCTS = 80;
const CATALOG_TTL_MS = 1000 * 60 * 10;

let memoryCache = null;
let catalogSnapshot = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function parseJSON(rawValue, fallbackValue) {
  if (!rawValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return fallbackValue;
  }
}

function ensureProductCache() {
  if (memoryCache) {
    return memoryCache;
  }

  memoryCache = new Map();

  if (!canUseStorage()) {
    return memoryCache;
  }

  const entries = parseJSON(window.sessionStorage.getItem(PRODUCT_STORAGE_KEY), []);
  if (!Array.isArray(entries)) {
    return memoryCache;
  }

  entries.forEach((entry) => {
    if (entry?.id && entry?.product) {
      memoryCache.set(entry.id, entry);
    }
  });

  return memoryCache;
}

function ensureCatalogSnapshot() {
  if (catalogSnapshot) {
    return catalogSnapshot;
  }

  if (!canUseStorage()) {
    return null;
  }

  const parsed = parseJSON(window.sessionStorage.getItem(CATALOG_STORAGE_KEY), null);
  if (!parsed?.products || !Array.isArray(parsed.products)) {
    return null;
  }

  catalogSnapshot = parsed;
  return catalogSnapshot;
}

function persistProductCache(cache) {
  if (!canUseStorage()) {
    return;
  }

  const entries = [...cache.values()]
    .sort((a, b) => (b.cachedAt || 0) - (a.cachedAt || 0))
    .slice(0, MAX_PRODUCTS);

  window.sessionStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(entries));
}

function persistCatalogSnapshot(snapshot) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(snapshot));
}

function toMillis(value) {
  if (!value) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000);
  }

  return 0;
}

export function sortProductsByNewest(products = []) {
  return [...products].sort((left, right) => {
    const createdDelta = toMillis(right.createdAt) - toMillis(left.createdAt);
    if (createdDelta !== 0) {
      return createdDelta;
    }

    return String(left.name || "").localeCompare(String(right.name || ""));
  });
}

export function getNewestProducts(products = [], limit = 12) {
  return sortProductsByNewest(products).slice(0, limit);
}

export function getCategoriesFromProducts(products = []) {
  const categories = new Set();

  products.forEach((product) => {
    if (product?.category) {
      categories.add(String(product.category).toLowerCase());
    }
  });

  return ["all", ...[...categories].sort()];
}

export function getSimilarProducts(products = [], product, limit = 4) {
  if (!product?.category) {
    return [];
  }

  return getNewestProducts(
    products.filter((item) => item?.id !== product.id && item?.category === product.category),
    limit
  );
}

export function cacheProducts(products = []) {
  if (!Array.isArray(products) || products.length === 0) {
    return;
  }

  const cache = ensureProductCache();
  const now = Date.now();

  products.forEach((product) => {
    if (!product?.id) {
      return;
    }

    cache.set(product.id, {
      id: product.id,
      product,
      cachedAt: now,
    });
  });

  persistProductCache(cache);
}

export function cacheCatalog(products = []) {
  if (!Array.isArray(products) || products.length === 0) {
    return;
  }

  const snapshot = {
    products,
    cachedAt: Date.now(),
  };

  catalogSnapshot = snapshot;
  cacheProducts(products);
  persistCatalogSnapshot(snapshot);
}

export function getCachedCatalog() {
  const snapshot = ensureCatalogSnapshot();
  if (!snapshot?.products?.length) {
    return null;
  }

  return {
    ...snapshot,
    isStale: Date.now() - (snapshot.cachedAt || 0) > CATALOG_TTL_MS,
  };
}

export function getCachedProduct(productId) {
  if (!productId) {
    return null;
  }

  const cache = ensureProductCache();
  const cachedProduct = cache.get(productId)?.product;
  if (cachedProduct) {
    return cachedProduct;
  }

  const snapshot = ensureCatalogSnapshot();
  return snapshot?.products?.find((product) => product?.id === productId) || null;
}

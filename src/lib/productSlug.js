const APOSTROPHE_LIKE_CHARS = /['’‘`´]/g;
const DIACRITIC_MARKS = /[\u0300-\u036f]/g;

export function safeDecodeSlug(value = "") {
  const rawValue = Array.isArray(value) ? value[0] : value;

  try {
    return decodeURIComponent(String(rawValue || ""));
  } catch {
    return String(rawValue || "");
  }
}

export function slugifyProduct(value = "") {
  return String(value || "")
    .normalize("NFKD")
    .replace(DIACRITIC_MARKS, "")
    .replace(/&/g, " and ")
    .replace(APOSTROPHE_LIKE_CHARS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductSlug(product) {
  return slugifyProduct(product?.slug || product?.name || product?.model || product?.id);
}

export function getProductHref(product) {
  const slug = getProductSlug(product);
  const fallbackId = product?.id ? encodeURIComponent(String(product.id)) : "";

  return `/product/${slug || fallbackId}`;
}

export function productMatchesSlug(product, routeSlug) {
  if (!product || !routeSlug) {
    return false;
  }

  const decodedSlug = safeDecodeSlug(routeSlug);
  if (product.id === routeSlug || product.id === decodedSlug) {
    return true;
  }

  const targetSlug = slugifyProduct(decodedSlug);
  if (!targetSlug) {
    return false;
  }

  return [product.slug, product.name, product.model, product.id].some(
    (candidate) => slugifyProduct(candidate) === targetSlug
  );
}

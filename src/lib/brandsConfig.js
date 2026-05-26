/**
 * Master brand config.
 * `searchTerms` are used to auto-match products that don't have an explicit `brand` field
 * by checking if the product name contains any of these terms (case-insensitive).
 */
export const BRANDS = [
    {
        id: "audemars-piguet",
        name: "Audemars Piguet",
        logo: "/brands/Audemars Piguet.jpg",
        searchTerms: ["audemars", "piguet", "royal oak"],
    },
    {
        id: "benyar",
        name: "Benyar",
        logo: "/brands/benyar.webp",
        searchTerms: ["benyar"],
    },
    {
        id: "cartier",
        name: "Cartier",
        logo: "/brands/cartier.webp",
        searchTerms: ["cartier"],
    },
    {
        id: "citizen",
        name: "Citizen",
        logo: "/brands/citizen.png",
        searchTerms: ["citizen"],
    },
    {
        id: "curren",
        name: "Curren",
        logo: "/brands/curren.webp",
        searchTerms: ["curren"],
    },
    {
        id: "dsigner",
        name: "Dsigner",
        logo: "/brands/dsigner-log.jpeg",
        searchTerms: ["dsigner"],
    },
    {
        id: "elegance",
        name: "Elegance",
        logo: "/brands/elegance.png",
        searchTerms: ["elegance"],
    },
    {
        id: "fitron",
        name: "Fitron",
        logo: "/brands/fitron.jpg",
        searchTerms: ["fitron"],
    },
    {
        id: "franck-muller",
        name: "Franck Muller",
        logo: "/brands/franck-muller.png",
        searchTerms: ["franck", "muller"],
    },
    {
        id: "hublot",
        name: "Hublot",
        logo: "/brands/hublot.png",
        searchTerms: ["hublot"],
    },
    {
        id: "naviforce",
        name: "Naviforce",
        logo: "/brands/naviforce.jpg",
        searchTerms: ["naviforce"],
    },
    {
        id: "pagani-design",
        name: "Pagani Design",
        logo: "/brands/pagani design.jpg",
        searchTerms: ["pagani"],
    },
    {
        id: "patek",
        name: "Patek Philippe",
        logo: "/brands/patek.avif",
        searchTerms: ["patek"],
    },
    {
        id: "rado",
        name: "Rado",
        logo: "/brands/rado.jpg",
        searchTerms: ["rado"],
    },
    {
        id: "rolex",
        name: "Rolex",
        logo: "/brands/rolex.avif",
        searchTerms: ["rolex"],
    },
    {
        id: "seastar",
        name: "Seastar",
        logo: "/brands/seastar.jpg",
        searchTerms: ["seastar"],
    },
    {
        id: "skmei",
        name: "Skmei",
        logo: "/brands/Skmei.webp",
        searchTerms: ["skmei"],
    },
    {
        id: "tissot",
        name: "Tissot",
        logo: "/brands/tissot.webp",
        searchTerms: ["tissot"],
    },
];

/**
 * Given a product, returns its brand ID.
 * First checks the explicit `brand` field on the product,
 * then falls back to matching the product name against searchTerms.
 */
export function getProductBrandId(product) {
    if (product.brand) return product.brand;
    const nameLower = (product.name || "").toLowerCase();
    for (const brand of BRANDS) {
        if (brand.searchTerms.some((term) => nameLower.includes(term))) {
            return brand.id;
        }
    }
    return null;
}

/**
 * Given a brand ID, returns the brand config object or null.
 */
export function getBrandById(id) {
    return BRANDS.find((b) => b.id === id) || null;
}

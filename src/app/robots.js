// robots.txt for SEO crawling
// TODO: When domain is ready, change to https://saqib.watch

export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/api/", "/checkout/"],
            },
        ],
        sitemap: "https://saqib-watches.vercel.app/sitemap.xml",
    };
}

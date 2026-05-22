import { products } from "@/data/products";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProductHref } from "@/lib/productSlug";

export async function generateStaticParams() {
    const categories = ["men", "women", "couples"];
    return categories.map((slug) => ({
        slug,
    }));
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    const categoryProducts = products.filter((p) => p.category === slug);

    const titles = {
        men: "Watches For Men",
        women: "Watches For Women",
        couples: "Watches For Couples",
    };

    const title = titles[slug];

    if (!title) {
        notFound();
    }

    return (
        <>
            <Header />
            <main className="pt-24 min-h-screen bg-dark" style={{ padding: "8.5vw 2vw 3vw 2vw" }}>
                <div className="w-full px-6 md:px-12 2xl:px-20 py-12 md:py-20">
                    <div className="text-center mb-16">
                        <p className="text-gold tracking-[0.4em] text-xs uppercase mb-3">
                            Collection
                        </p>
                        <h1 className="font-serif text-4xl md:text-6xl text-white font-light">
                            {title}
                        </h1>
                        <div className="mt-6 w-16 h-px bg-gold mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {categoryProducts.map((watch) => (
                            <Link
                                key={watch.id}
                                href={getProductHref(watch)}
                                className="group cursor-pointer block"
                            >
                                <div className="relative overflow-hidden bg-dark-card rounded-lg aspect-[3/4] mb-4">
                                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                                        <svg viewBox="0 0 200 300" className="w-3/4 h-3/4">
                                            <rect
                                                x="70"
                                                y="10"
                                                width="60"
                                                height="80"
                                                rx="8"
                                                fill={watch.color}
                                                opacity="0.8"
                                            />
                                            <circle cx="100" cy="150" r="55" fill={watch.color} />
                                            <circle
                                                cx="100"
                                                cy="150"
                                                r="52"
                                                fill="none"
                                                stroke={watch.accent}
                                                strokeWidth="1.5"
                                            />
                                            <circle
                                                cx="100"
                                                cy="150"
                                                r="44"
                                                fill="#0a0a0a"
                                                opacity="0.9"
                                            />
                                            <line
                                                x1="100"
                                                y1="150"
                                                x2="100"
                                                y2="120"
                                                stroke={watch.accent}
                                                strokeWidth="2"
                                            />
                                            <line
                                                x1="100"
                                                y1="150"
                                                x2="120"
                                                y2="140"
                                                stroke={watch.accent}
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                </div>
                                <h3 className="font-serif text-lg text-center text-white group-hover:text-gold transition-colors duration-300">
                                    {watch.name}
                                </h3>
                                <p className="text-center text-gold text-sm mt-1">
                                    {watch.price}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {categoryProducts.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-muted text-lg">
                                No products found in this category.
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

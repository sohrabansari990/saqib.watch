import { products } from "@/data/products";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductActions from "@/components/ProductActions";

export async function generateStaticParams() {
    return products.map((product) => ({
        id: product.id,
    }));
}

export default async function ProductPage({ params }) {
    const { id } = await params;
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    return (
        <>
            <Header />
            <main className="pt-24 min-h-screen bg-dark">
                <div className="w-full px-6 md:px-12 2xl:px-20 py-12 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Image Section */}
                        <div className="relative aspect-[3/4] bg-dark-card rounded-lg overflow-hidden flex items-center justify-center p-8 border border-white/5">
                            <svg viewBox="0 0 200 300" className="w-3/4 h-3/4 dropshadow-2xl">
                                <rect
                                    x="70"
                                    y="10"
                                    width="60"
                                    height="80"
                                    rx="8"
                                    fill={product.color}
                                    opacity="0.6"
                                />
                                <circle
                                    cx="100"
                                    cy="150"
                                    r="44"
                                    fill="#0a0a0a"
                                    opacity="0.9"
                                />
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const angle = (i * 30 * Math.PI) / 180;
                                    const x1 = 100 + 38 * Math.sin(angle);
                                    const y1 = 150 - 38 * Math.cos(angle);
                                    const x2 = 100 + 42 * Math.sin(angle);
                                    const y2 = 150 - 42 * Math.cos(angle);
                                    return (
                                        <line
                                            key={i}
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke={product.accent}
                                            strokeWidth={i % 3 === 0 ? 1.5 : 0.5}
                                            opacity="0.8"
                                        />
                                    );
                                })}
                                <line
                                    x1="100"
                                    y1="150"
                                    x2="100"
                                    y2="118"
                                    stroke={product.accent}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="100"
                                    y1="150"
                                    x2="125"
                                    y2="138"
                                    stroke={product.accent}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="100"
                                    y1="150"
                                    x2="95"
                                    y2="120"
                                    stroke="#e74c3c"
                                    strokeWidth="0.5"
                                    strokeLinecap="round"
                                />
                                <circle cx="100" cy="150" r="2.5" fill={product.accent} />
                                <text
                                    x="100"
                                    y="170"
                                    textAnchor="middle"
                                    fill={product.accent}
                                    fontSize="5"
                                    fontFamily="serif"
                                    opacity="0.7"
                                >
                                    SVESTON
                                </text>
                                <rect
                                    x="70"
                                    y="210"
                                    width="60"
                                    height="80"
                                    rx="8"
                                    fill={product.color}
                                    opacity="0.8"
                                />
                                <rect
                                    x="75"
                                    y="215"
                                    width="50"
                                    height="70"
                                    rx="6"
                                    fill="none"
                                    stroke={product.accent}
                                    strokeWidth="0.5"
                                    opacity="0.3"
                                />
                            </svg>
                        </div>

                        {/* Details Section */}
                        <div>
                            <Link
                                href="/"
                                className="text-gold text-xs tracking-[0.2em] uppercase mb-4 inline-block hover:underline"
                            >
                                ← Back to Home
                            </Link>
                            <h1 className="font-serif text-4xl md:text-5xl text-white font-light mb-4">
                                {product.name}
                            </h1>
                            <p className="text-2xl text-gold mb-6">{product.price}</p>
                            <div className="w-16 h-px bg-white/20 mb-8" />
                            <p className="text-gray-muted leading-relaxed mb-8 text-lg">
                                {product.description}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <span className="text-gray-muted text-sm uppercase tracking-wider">
                                        Model
                                    </span>
                                    <span className="text-white">{product.id}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <span className="text-gray-muted text-sm uppercase tracking-wider">
                                        Category
                                    </span>
                                    <span className="text-white capitalize">
                                        {product.category}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <span className="text-gray-muted text-sm uppercase tracking-wider">
                                        Availability
                                    </span>
                                    <span className="text-green-500">In Stock</span>
                                </div>
                            </div>

                            <ProductActions product={product} />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // useParams is cleaner in Client Components
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductActions from "@/components/ProductActions";

export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    router.push("/gallery");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, router]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="pt-24 min-h-screen bg-dark flex items-center justify-center">
                    <div className="text-white animate-pulse">Loading Product...</div>
                </main>
                <Footer />
            </>
        );
    }

    if (!product) return null;

    return (
        <>
            <Header />
            <main className="pt-24 min-h-screen bg-dark">
                <div className="w-full px-6 md:px-12 2xl:px-20 py-12 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Image Section */}
                        <div className="relative aspect-[3/4] bg-dark-card rounded-lg overflow-hidden flex items-center justify-center border border-white/5 group">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="text-gray-500">No Image Available</div>
                            )}

                            {product.mode && product.mode !== 'new' && (
                                <span className="absolute top-6 left-6 bg-gold text-black text-xs font-bold px-3 py-1 uppercase tracking-wider z-10">
                                    {product.mode}
                                </span>
                            )}
                        </div>

                        {/* Details Section */}
                        <div>
                            <Link
                                href="/gallery"
                                className="text-gold text-xs tracking-[0.2em] uppercase mb-4 inline-block hover:underline"
                            >
                                ← Back to Collection
                            </Link>
                            <h1 className="font-serif text-4xl md:text-5xl text-white font-light mb-4">
                                {product.name}
                            </h1>
                            <p className="text-2xl text-gold mb-6">
                                Rs. {product.price?.toLocaleString()}
                            </p>
                            <div className="w-16 h-px bg-white/20 mb-8" />
                            <p className="text-gray-muted leading-relaxed mb-8 text-lg whitespace-pre-line">
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

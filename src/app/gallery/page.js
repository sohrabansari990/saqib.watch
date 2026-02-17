"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const categories = ["all", "men", "women", "couples", "monitor", "other"];

export default function GalleryPage() {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let q = collection(db, "products");
                if (filter !== "all") {
                    q = query(collection(db, "products"), where("category", "==", filter));
                }

                const querySnapshot = await getDocs(q);
                const productsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsList);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [filter]);

    return (
        <>
            <Header />
            <main className="pt-24 min-h-screen bg-dark">
                <div className="w-full px-6 md:px-12 2xl:px-20 py-12 md:py-20">
                    <div className="text-center mb-12">
                        <p className="text-gold tracking-[0.4em] text-xs uppercase mb-3">
                            Collection
                        </p>
                        <h1 className="font-serif text-4xl md:text-6xl text-white font-light">
                            Product Gallery
                        </h1>
                        <div className="mt-6 w-16 h-px bg-gold mx-auto" />
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={cn(
                                    "px-6 py-2 text-sm uppercase tracking-widest border transition-all duration-300",
                                    filter === cat
                                        ? "border-gold bg-gold text-black font-semibold"
                                        : "border-white/10 text-gray-400 hover:border-gold hover:text-gold"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center text-white py-20 animate-pulse">Loading Collection...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.length === 0 ? (
                                <div className="col-span-full text-center text-gray-500 py-20">
                                    No products found in this category.
                                </div>
                            ) : (
                                products.map((watch) => (
                                    <Link
                                        key={watch.id}
                                        href={`/product/${watch.id}`}
                                        className="group cursor-pointer block"
                                    >
                                        <div className="relative overflow-hidden bg-dark-card rounded-lg aspect-[3/4] mb-4 border border-white/5">
                                            {watch.imageUrl ? (
                                                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                                                    <img
                                                        src={watch.imageUrl}
                                                        alt={watch.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                                    <span className="text-gray-600 text-xs">No Image</span>
                                                </div>
                                            )}

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                                            {watch.mode && watch.mode !== 'new' && (
                                                <span className="absolute top-4 left-4 bg-gold text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                                                    {watch.mode}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-serif text-lg text-center text-white group-hover:text-gold transition-colors duration-300">
                                            {watch.name}
                                        </h3>
                                        <p className="text-center text-gold text-sm mt-1">
                                            Rs. {watch.price?.toLocaleString()}
                                        </p>
                                    </Link>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

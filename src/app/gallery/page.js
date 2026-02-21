"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";

const DEFAULT_CATEGORIES = ["all", "men", "women", "couples"];

function GalleryContent() {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasSyncedQuery = useRef(false);
    const { toggleFavorite, isFavorite } = useFavorites();

    // Fetch dynamic categories from all products
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const snapshot = await getDocs(collection(db, "products"));
                const cats = new Set();
                snapshot.docs.forEach((d) => {
                    const cat = d.data().category;
                    if (cat) cats.add(cat.toLowerCase());
                });
                const dynamicCats = ["all", ...([...cats].sort())];
                setCategories(dynamicCats);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Sync initial filter from URL query
    useEffect(() => {
        const qp = searchParams.get("category");
        if (qp) {
            setFilter(qp);
        }
    }, [searchParams]);

    // Keep URL in sync with current filter (skip first sync until initial read)
    useEffect(() => {
        if (!router) return;
        if (!hasSyncedQuery.current) {
            hasSyncedQuery.current = true;
            return;
        }
        const queryString = filter === "all" ? "" : `?category=${filter}`;
        router.replace(`/gallery${queryString}`, { scroll: false });
    }, [filter, router]);

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
        <main className="pt-24 min-h-screen bg-dark" style={{ padding: "8.5vw 2vw 3vw 2vw" }}>
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
                                <div key={watch.id} className="group cursor-pointer block relative">
                                    <Link href={`/product/${watch.id}`}>
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
                                    </Link>

                                    {/* Favorite icon - always visible on top-right of image */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFavorite(watch);
                                        }}
                                        className={`absolute top-6 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                                            isFavorite(watch.id)
                                                ? "bg-white/90 text-red-500 opacity-100"
                                                : "bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white/90 hover:text-red-500"
                                        }`}
                                    >
                                        <Heart size={18} fill={isFavorite(watch.id) ? "currentColor" : "none"} />
                                    </button>

                                    <Link href={`/product/${watch.id}`}>
                                        <h3 className="font-serif text-lg text-center text-white group-hover:text-gold transition-colors duration-300">
                                            {watch.name}
                                        </h3>
                                        <p className="text-center text-gold text-sm mt-1">
                                            Rs. {watch.price?.toLocaleString()}
                                        </p>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default function GalleryPage() {
    return (
        <>
            <Header />
            <Suspense fallback={
                <div className="min-h-screen bg-dark flex items-center justify-center text-gold uppercase tracking-widest animate-pulse">
                    Initializing Gallery...
                </div>
            }>
                <GalleryContent />
            </Suspense>
            <Footer />
        </>
    );
}

"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { Heart, X } from "lucide-react";

const DEFAULT_CATEGORIES = ["all", "men", "women", "couples"];

function GalleryContent() {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("default");
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasSyncedQuery = useRef(false);
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToCart } = useCart();

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

    // Apply sorting in memo
    const displayedProducts = useMemo(() => {
        let sorted = [...products];
        if (sortBy === "price_asc") {
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === "price_desc") {
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === "newest") {
            sorted.reverse(); // Simplified newest logic tracking default insert order inversed
        }
        return sorted;
    }, [products, sortBy]);

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

                {/* Filters and Sorting Row */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={cn(
                                    "px-6 py-2 text-sm uppercase tracking-widest border transition-all duration-200",
                                    filter === cat
                                        ? "bg-gold text-black border-transparent font-bold"
                                        : "bg-transparent border-white/10 text-gray-400 hover:border-gold hover:text-gold"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-[#1a1a1a] border border-gold text-gold py-2 pl-4 pr-10 rounded focus:outline-none focus:ring-1 focus:ring-gold text-sm tracking-wide uppercase cursor-pointer"
                        >
                            <option value="default">Default</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gold">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </div>
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
                            displayedProducts.map((watch) => (
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

                                            {/* Quick View Button Hover overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setQuickViewProduct(watch);
                                                    }}
                                                    className="bg-black/80 text-white border border-gold px-6 py-2 text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-colors backdrop-blur-sm"
                                                >
                                                    Quick View
                                                </button>
                                            </div>
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
            {/* Quick View Modal */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
                    <div className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl relative flex flex-col md:flex-row">
                        <button
                            onClick={() => setQuickViewProduct(null)}
                            className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        {/* Modal Image */}
                        <div className="w-full md:w-1/2 min-h-[300px] md:min-h-[400px] bg-black relative flex items-center justify-center">
                             {quickViewProduct.imageUrl ? (
                                <img
                                    src={quickViewProduct.imageUrl}
                                    alt={quickViewProduct.name}
                                    className="object-contain w-full h-[300px] md:h-[500px]"
                                />
                             ) : (
                                <span className="text-gray-600">No Image</span>
                             )}
                        </div>

                        {/* Modal Content */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                            <h2 className="font-serif text-3xl text-white mb-2">{quickViewProduct.name}</h2>
                            <p className="text-2xl text-gold mb-6">Rs. {quickViewProduct.price?.toLocaleString()}</p>
                            
                            {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                                <div className="mb-8">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest block mb-3">Color Options</span>
                                    <div className="flex gap-2">
                                        {quickViewProduct.variants.map((v) => (
                                            <div
                                                key={v.color}
                                                className="w-8 h-8 rounded-full border border-white/20"
                                                style={{ backgroundColor: v.hex }}
                                                title={v.color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    addToCart(quickViewProduct, 1, quickViewProduct.variants?.[0]?.color || null);
                                    setQuickViewProduct(null);
                                }}
                                className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 mb-4 hover:bg-[#b0923d] transition-colors"
                            >
                                Add to Cart
                            </button>
                            <Link
                                href={`/product/${quickViewProduct.id}`}
                                className="text-center text-gray-400 hover:text-gold text-xs uppercase tracking-[0.2em] transition-colors border-b border-transparent hover:border-gold pb-1 self-center"
                            >
                                View Full Details
                            </Link>
                        </div>
                    </div>
                </div>
            )}
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

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
import { Heart, X, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_CATEGORIES = ["all", "men", "women", "couples"];

function GalleryContent() {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("default");
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [selectedQuickViewColor, setSelectedQuickViewColor] = useState(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
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
                    <div style={{ padding: "0.5vw 0.5vw 0.5vw 0.5vw" }} className="flex cursor-pointer flex-wrap justify-center gap-2 p-1 bg-[#1a1a1a] rounded-full border border-white/5">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                style={{ padding: "10px 32px" }}
                                className={cn(
                                    "relative text-[10px] md:text-xs uppercase tracking-[0.2em] transition-colors duration-300 z-10",
                                    filter === cat ? "text-black font-bold" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <span className="relative z-10">{cat}</span>
                                {filter === cat && (
                                    <motion.div
                                        
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gold rounded-full z-0 shadow-[0_0_20px_rgba(201,169,76,0.2)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative z-40">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            style={{ padding: "14px 28px" }}
                            className="flex items-center justify-between min-w-[200px] bg-[#1a1a1a] border border-white/10 text-white rounded-full focus:outline-none focus:ring-1 focus:ring-gold text-[10px] tracking-[0.2em] uppercase transition-all duration-300 hover:border-gold/50 group shadow-xl"
                        >
                            <span className="opacity-60 mr-2">Sort:</span>
                            <span className="font-bold">
                                {sortBy === "default" && "Default"}
                                {sortBy === "price_asc" && "Price: Low to High"}
                                {sortBy === "price_desc" && "Price: High to Low"}
                                {sortBy === "newest" && "Newest First"}
                            </span>
                            <ChevronDown size={14} className={cn("ml-3 transition-transform duration-300", isSortOpen ? "rotate-180" : "")} />
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-30" 
                                        onClick={() => setIsSortOpen(false)} 
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute right-0 mt-3 w-64 bg-[#111] border border-white/5 rounded-2xl shadow-2xl overflow-hidden z-40 backdrop-blur-xl"
                                    >
                                        {[
                                            { id: "default", label: "Default" },
                                            { id: "price_asc", label: "Price: Low to High" },
                                            { id: "price_desc", label: "Price: High to Low" },
                                            { id: "newest", label: "Newest First" }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    setSortBy(opt.id);
                                                    setIsSortOpen(false);
                                                }}
                                                style={{ padding: "16px 24px" }}
                                                className={cn(
                                                    "w-full text-left text-[10px] tracking-[0.2em] uppercase transition-all duration-200 border-b border-white/5 last:border-none flex items-center justify-between group",
                                                    sortBy === opt.id ? "text-gold bg-gold/5" : "text-gray-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                {opt.label}
                                                {sortBy === opt.id && <Check size={12} />}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
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
                                            <div  className="absolute bottom-6 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20">
                                                <button
                                                style={{padding : "10px"}}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setQuickViewProduct(watch);
                                                        setSelectedQuickViewColor(watch.variants?.[0]?.color || null);
                                                    }}
                                                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-gold hover:border-gold hover:text-black font-semibold text-[10px] tracking-[0.2em] uppercase px-8 py-3 rounded-full transition-all duration-300 shadow-xl"
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
                        <div className="w-full md:w-1/2 min-h-[300px] md:min-h-[500px] bg-dark relative flex items-center justify-center overflow-hidden">
                             <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedQuickViewColor || "default"}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    onLoadStart={() => setIsImageLoading(true)}
                                    onLoad={() => setIsImageLoading(false)}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    src={
                                        selectedQuickViewColor 
                                            ? quickViewProduct.variants?.find(v => v.color === selectedQuickViewColor)?.images?.[0] || quickViewProduct.imageUrl
                                            : quickViewProduct.imageUrl
                                    }
                                    alt={quickViewProduct.name}
                                    className="object-cover w-full h-full absolute inset-0"
                                />
                             </AnimatePresence>
                             
                             {/* Loading Spinner */}
                             {isImageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 transition-opacity duration-300">
                                    <div className="w-12 h-12 border-2 border-white/5 border-t-gold rounded-full animate-spin shadow-[0_0_15px_rgba(201,169,76,0.2)]"></div>
                                </div>
                             )}
                             
                             <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Modal Content */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#0a0a0a]">
                            <h2 className="font-serif text-3xl md:text-4xl text-white mb-2">{quickViewProduct.name}</h2>
                            <p className="text-xl md:text-2xl text-gold mb-8">Rs. {quickViewProduct.price?.toLocaleString()}</p>
                            
                            {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                                <div className="mb-10">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest block mb-4">
                                        Color: <span className="text-white ml-2">{selectedQuickViewColor || "Select"}</span>
                                    </span>
                                    <div className="flex gap-3">
                                        {quickViewProduct.variants.map((v) => (
                                            <button
                                                key={v.color}
                                                onClick={() => {
                                                    if (v.color !== selectedQuickViewColor) {
                                                        setIsImageLoading(true);
                                                        setSelectedQuickViewColor(v.color);
                                                    }
                                                }}
                                                className={`w-10 h-10 rounded-full border-2 transition-all duration-300 relative flex items-center justify-center ${
                                                    selectedQuickViewColor === v.color 
                                                        ? "border-gold scale-110 shadow-[0_0_15px_rgba(201,169,76,0.3)]" 
                                                        : "border-white/20 hover:border-white/50"
                                                }`}
                                                style={{ backgroundColor: v.hex }}
                                                title={v.color}
                                            >
                                                {selectedQuickViewColor === v.color && (
                                                    <Check size={14} className={cn(
                                                        v.color.toLowerCase() === 'white' ? 'text-black' : 'text-white'
                                                    )} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    addToCart(quickViewProduct, 1, selectedQuickViewColor || quickViewProduct.variants?.[0]?.color || null);
                                    setQuickViewProduct(null);
                                }}
                                className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 mb-4 hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-gold/20"
                            >
                                Add to Cart
                            </button>
                            <Link
                                href={`/product/${quickViewProduct.id}`}
                                className="text-center text-gray-400 hover:text-white text-[10px] uppercase tracking-[0.3em] transition-colors border-b border-white/10 hover:border-gold pb-1 self-center inline-block"
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

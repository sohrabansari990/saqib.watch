"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import CollectionLoader from "@/components/CollectionLoader";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { Heart, X, Check, ChevronDown, SlidersHorizontal, Grid2X2, Grid3X3, LayoutGrid, ListFilter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cacheCatalog, getCachedCatalog, getCategoriesFromProducts, sortProductsByNewest } from "@/lib/productCache";

function GalleryProductImage({ src, alt, sizes }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            {!loaded && <div className="skeleton-surface absolute inset-0 z-10" />}
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                className={cn("h-full w-full object-cover transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
                loading="lazy"
                quality={80}
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
            />
        </div>
    );
}

function DensityIcon({ columns, list = false, active = false }) {
    if (list) {
        return (
            <span style={{ display: "grid", gap: "3px", width: "18px" }}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <span
                        key={index}
                        style={{
                            height: "2px",
                            borderRadius: "999px",
                            background: active ? "#111" : "currentColor",
                            opacity: active ? 1 : 0.75,
                        }}
                    />
                ))}
            </span>
        );
    }

    return (
        <span
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 4px)`,
                gap: "2px",
            }}
        >
            {Array.from({ length: columns * columns }).map((_, index) => (
                <span
                    key={index}
                    style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "1px",
                        background: active ? "#111" : "currentColor",
                        opacity: active ? 1 : 0.75,
                    }}
                />
            ))}
        </span>
    );
}

function GalleryContent() {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState("all");
    const [availabilityFilter, setAvailabilityFilter] = useState("all");
    const [priceRange, setPriceRange] = useState([0, 0]);
    const [sortBy, setSortBy] = useState("best_selling");
    const [gridColumns, setGridColumns] = useState(4);
    const [viewMode, setViewMode] = useState("grid");
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [selectedQuickViewColor, setSelectedQuickViewColor] = useState(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(["all", "men", "women", "couples"]);
    const [activeSale, setActiveSale] = useState(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasSyncedQuery = useRef(false);
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToCart } = useCart();
    
    const prefetchProduct = (watch) => {
        const slug = watch.name.toLowerCase().replace(/ /g, '-');
        router.prefetch(`/product/${slug}`);
    };

    const sortOptions = [
        { id: "featured", label: "Featured" },
        { id: "relevant", label: "Most relevant" },
        { id: "best_selling", label: "Best selling" },
        { id: "az", label: "Alphabetically, A-Z" },
        { id: "za", label: "Alphabetically, Z-A" },
        { id: "price_asc", label: "Price, low to high" },
        { id: "price_desc", label: "Price, high to low" },
        { id: "oldest", label: "Date, old to new" },
        { id: "newest", label: "Date, new to old" },
    ];
    const activeSortLabel = sortOptions.find((option) => option.id === sortBy)?.label || "Best selling";

    const priceBounds = useMemo(() => {
        const prices = products
            .map((product) => Number(product.price) || 0)
            .filter((price) => price > 0);

        if (prices.length === 0) {
            return { min: 0, max: 0 };
        }

        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices)),
        };
    }, [products]);

    const inStockCount = useMemo(() => products.filter((product) => !product.soldOut).length, [products]);
    const outOfStockCount = products.length - inStockCount;
    const featuredProduct = useMemo(
        () => products.find((product) => product.featured === true || product.mode?.toLowerCase() === "featured") || null,
        [products]
    );

    useEffect(() => {
        const qp = searchParams.get("category");
        if (qp) {
            setFilter(qp);
        }
    }, [searchParams]);

    useEffect(() => {
        const cachedCatalog = getCachedCatalog();
        if (!cachedCatalog?.products?.length) {
            return;
        }

        setProducts(cachedCatalog.products);
        setCategories(getCategoriesFromProducts(cachedCatalog.products));
        setLoading(false);
    }, []);

    useEffect(() => {
        setPriceRange([priceBounds.min, priceBounds.max]);
    }, [priceBounds.min, priceBounds.max]);

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
        let isActive = true;

        const fetchData = async () => {
            if (!getCachedCatalog()?.products?.length) {
                setLoading(true);
            }

            try {
                const saleSnap = await getDoc(doc(db, "settings", "sale"));
                let saleData = null;
                if (saleSnap.exists() && saleSnap.data().active) {
                    saleData = saleSnap.data();
                    setActiveSale(saleData);
                }

                const querySnapshot = await getDocs(collection(db, "products"));
                if (!isActive) return;

                const productsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setProducts(productsList);
                
                const baseCats = getCategoriesFromProducts(productsList);
                if (saleData?.name) {
                    const saleCat = saleData.name.toLowerCase();
                    if (!baseCats.includes(saleCat)) {
                        setCategories(["all", saleCat, ...baseCats.filter(c => c !== "all")]);
                    } else {
                        setCategories(baseCats);
                    }
                } else {
                    setCategories(baseCats);
                }
                
                cacheCatalog(productsList);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        fetchData();
        return () => { isActive = false; };
    }, []);

    const displayedProducts = useMemo(() => {
        const saleName = activeSale?.name?.toLowerCase();
        
        let filtered = products;
        if (filter !== "all") {
            if (saleName && filter === saleName) {
                filtered = products.filter((p) => {
                    const matchesName = (p.mode?.toLowerCase() === saleName) || (p.category?.toLowerCase() === saleName);
                    const isHighDiscount = (p.discount >= 20);
                    return matchesName || isHighDiscount;
                });
            } else {
                filtered = products.filter((product) => product.category === filter);
            }
        }

        if (availabilityFilter === "in") {
            filtered = filtered.filter((product) => !product.soldOut);
        } else if (availabilityFilter === "out") {
            filtered = filtered.filter((product) => product.soldOut);
        }

        filtered = filtered.filter((product) => {
            const price = Number(product.price) || 0;
            const [minPrice, maxPrice] = priceRange;
            if (maxPrice === 0) return true;
            return price >= minPrice && price <= maxPrice;
        });

        let sorted = [...filtered];

        if (sortBy === "featured") {
            sorted.sort((a, b) => Number(b.featured === true) - Number(a.featured === true));
        } else if (sortBy === "relevant") {
            sorted.sort((a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0));
        } else if (sortBy === "best_selling") {
            sorted.sort((a, b) => (Number(b.sales || b.sold || b.discount) || 0) - (Number(a.sales || a.sold || a.discount) || 0));
        } else if (sortBy === "az") {
            sorted.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
        } else if (sortBy === "za") {
            sorted.sort((a, b) => String(b.name || "").localeCompare(String(a.name || "")));
        } else if (sortBy === "price_asc") {
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === "price_desc") {
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === "newest") {
            sorted = sortProductsByNewest(sorted);
        } else if (sortBy === "oldest") {
            sorted = sortProductsByNewest(sorted).reverse();
        }
        return sorted;
    }, [activeSale?.name, availabilityFilter, filter, priceRange, products, sortBy]);

    const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;
    const updateMinPrice = (value) => {
        const next = Math.min(Number(value), priceRange[1] || priceBounds.max);
        setPriceRange([next, priceRange[1]]);
    };
    const updateMaxPrice = (value) => {
        const next = Math.max(Number(value), priceRange[0]);
        setPriceRange([priceRange[0], next]);
    };
    const clearFilters = () => {
        setFilter("all");
        setAvailabilityFilter("all");
        setPriceRange([priceBounds.min, priceBounds.max]);
    };
    const priceSpread = Math.max(priceBounds.max - priceBounds.min, 1);
    const minPricePercent = ((priceRange[0] - priceBounds.min) / priceSpread) * 100;
    const maxPricePercent = ((priceRange[1] - priceBounds.min) / priceSpread) * 100;
    const handleRangeTrackClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const nextValue = Math.round(priceBounds.min + percent * priceSpread);
        const distanceToMin = Math.abs(nextValue - priceRange[0]);
        const distanceToMax = Math.abs(nextValue - priceRange[1]);

        if (distanceToMin <= distanceToMax) {
            updateMinPrice(nextValue);
        } else {
            updateMaxPrice(nextValue);
        }
    };

    const FilterPanel = ({ mobile = false }) => (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#101010", color: "#f8f5ef" }}>
            <div style={{ padding: "24px 24px 22px", borderBottom: "1px solid rgba(201,169,110,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: 800, lineHeight: 1.2 }}>Products Category</h2>
                {mobile && (
                    <button type="button" onClick={() => setIsFilterOpen(false)} style={{ width: "38px", height: "38px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "#f8f5ef" }}>
                        <X size={18} />
                    </button>
                )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
                <div style={{ padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <label style={{ display: "block", marginBottom: "12px", fontSize: "13px", fontWeight: 800 }}>Category</label>
                    <select value={filter} onChange={(event) => setFilter(event.target.value)} style={{ width: "100%", height: "46px", padding: "0 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.14)", background: "#050505", color: "#f8f5ef", fontSize: "14px", fontWeight: 700, textTransform: "capitalize", outline: "none" }}>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div style={{ padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <p style={{ fontSize: "15px", fontWeight: 800 }}>Availability</p>
                        <span style={{ fontSize: "22px", lineHeight: 1, color: "#c9a96e" }}>-</span>
                    </div>
                    {[
                        { id: "in", label: "In stock", count: inStockCount },
                        { id: "out", label: "Out of stock", count: outOfStockCount },
                    ].map((option) => (
                        <label key={option.id} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", color: "rgba(248,245,239,0.72)", fontSize: "14px", cursor: "pointer" }}>
                            <input type="checkbox" checked={availabilityFilter === option.id} onChange={() => setAvailabilityFilter(availabilityFilter === option.id ? "all" : option.id)} style={{ width: "16px", height: "16px", accentColor: "#c9a96e" }} />
                            <span>{option.label} ({option.count})</span>
                        </label>
                    ))}
                </div>

                <div style={{ padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <p style={{ fontSize: "15px", fontWeight: 800 }}>Price</p>
                        <span style={{ fontSize: "22px", lineHeight: 1, color: "#c9a96e" }}>-</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 18px 1fr", alignItems: "center", gap: "12px" }}>
                        <input type="number" value={priceRange[0]} min={priceBounds.min} max={priceRange[1]} onChange={(event) => updateMinPrice(event.target.value)} style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.12)", background: "#050505", color: "#f8f5ef", fontSize: "14px", outline: "none" }} />
                        <span style={{ textAlign: "center", color: "rgba(248,245,239,0.45)" }}>-</span>
                        <input type="number" value={priceRange[1]} min={priceRange[0]} max={priceBounds.max} onChange={(event) => updateMaxPrice(event.target.value)} style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.12)", background: "#050505", color: "#f8f5ef", fontSize: "14px", outline: "none" }} />
                    </div>
                    <div onClick={handleRangeTrackClick} style={{ position: "relative", height: "34px", marginTop: "18px", display: "flex", alignItems: "center" }}>
                        <div style={{ position: "absolute", left: 0, right: 0, height: "4px", borderRadius: "999px", background: "rgba(255,255,255,0.16)" }} />
                        <div style={{ position: "absolute", left: `${minPricePercent}%`, width: `${Math.max(maxPricePercent - minPricePercent, 0)}%`, height: "4px", borderRadius: "999px", background: "#c9a96e" }} />
                        <input className="price-range-input" type="range" min={priceBounds.min} max={priceBounds.max} value={priceRange[0]} onChange={(event) => updateMinPrice(event.target.value)} style={{ position: "absolute", inset: 0, width: "100%" }} />
                        <input className="price-range-input" type="range" min={priceBounds.min} max={priceBounds.max} value={priceRange[1]} onChange={(event) => updateMaxPrice(event.target.value)} style={{ position: "absolute", inset: 0, width: "100%" }} />
                    </div>
                    <p style={{ marginTop: "14px", color: "rgba(248,245,239,0.72)", fontSize: "14px" }}>
                        Price: <span style={{ color: "#f8f5ef", fontWeight: 800 }}>{formatMoney(priceRange[0])} - {formatMoney(priceRange[1])}</span>
                    </p>
                </div>

                <div style={{ padding: "24px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <p style={{ fontSize: "15px", fontWeight: 800 }}>Featured product</p>
                        <span style={{ fontSize: "22px", lineHeight: 1, color: "#c9a96e" }}>-</span>
                    </div>
                    {featuredProduct ? (
                        <Link href={`/product/${featuredProduct.name.toLowerCase().replace(/ /g, '-')}`} style={{ display: "grid", gridTemplateColumns: "72px minmax(0, 1fr)", gap: "12px", alignItems: "center", color: "#f8f5ef", textDecoration: "none" }}>
                            <div style={{ position: "relative", width: "72px", aspectRatio: "1 / 1", borderRadius: "8px", overflow: "hidden", background: "#171717" }}>
                                {featuredProduct.imageUrl ? (
                                    <Image src={featuredProduct.imageUrl} alt={featuredProduct.name} fill sizes="72px" className="object-cover" />
                                ) : (
                                    <div className="skeleton-surface" style={{ width: "100%", height: "100%" }} />
                                )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: "13px", fontWeight: 800, lineHeight: 1.25 }}>{featuredProduct.name}</p>
                                <p style={{ marginTop: "4px", color: "#c9a96e", fontSize: "12px", fontWeight: 800 }}>Rs. {featuredProduct.price?.toLocaleString()}</p>
                            </div>
                        </Link>
                    ) : (
                        <p style={{ color: "rgba(248,245,239,0.52)", fontSize: "13px" }}>No featured product selected.</p>
                    )}
                </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(201,169,110,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", background: "#101010" }}>
                <button type="button" onClick={clearFilters} style={{ border: 0, background: "transparent", color: "#f8f5ef", fontSize: "14px", fontWeight: 800, textDecoration: "underline", textUnderlineOffset: "4px", cursor: "pointer" }}>Clear all</button>
                {mobile && (
                    <button type="button" onClick={() => setIsFilterOpen(false)} style={{ minWidth: "112px", height: "44px", border: 0, borderRadius: "999px", background: "#c9a96e", color: "#050505", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>Apply</button>
                )}
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-dark" style={{ paddingTop: "150px", paddingLeft: "16px", paddingRight: "16px", paddingBottom: "3vw" }}>
            <div className="w-full px-6 md:px-12 2xl:px-20 py-12 md:py-20">
                <div className="text-center mb-12">
                    <p className="text-gold tracking-[0.4em] text-xs uppercase mb-3">Collection</p>
                    <h1 className="font-serif text-4xl md:text-6xl text-white font-light">Product Gallery</h1>
                    <div className="mt-6 w-16 h-px bg-gold mx-auto" />
                </div>

                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => setIsFilterOpen(true)} className="lg:hidden" style={{ height: "38px", padding: "0 14px", border: "1px solid rgba(201,169,110,0.5)", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(201,169,110,0.14)", color: "#f8f5ef", fontSize: "12px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                            <SlidersHorizontal size={15} color="#c9a96e" />
                            Filter
                        </button>
                        <p className="text-sm text-gray-400">Showing <span className="font-bold text-white">{displayedProducts.length}</span> of {products.length} products</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative z-40">
                            <button onClick={() => setIsSortOpen(!isSortOpen)} style={{ padding: "12px 18px" }} className="flex min-w-52 items-center justify-between rounded-full border border-white/10 bg-dark-card text-white shadow-xl transition-all duration-300 hover:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold">
                                <span className="mr-2 text-xs text-white/55">Sort by:</span>
                                <span className="text-xs font-bold">{activeSortLabel}</span>
                                <ChevronDown size={15} className={cn("ml-3 transition-transform duration-300", isSortOpen ? "rotate-180" : "")} />
                            </button>
                            <AnimatePresence>
                                {isSortOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30 bg-black/40 md:bg-transparent" onClick={() => setIsSortOpen(false)} />
                                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl border border-white/10 bg-[#111] p-4 shadow-2xl md:absolute md:bottom-auto md:left-auto md:right-0 md:mt-3 md:w-72 md:rounded-2xl">
                                            <button type="button" onClick={() => setIsSortOpen(false)} className="md:hidden" style={{ position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)", width: "44px", height: "44px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.12)", background: "#f8f5ef", color: "#050505", display: "flex", alignItems: "center", justifyCenter: "center" }}>
                                                <X size={18} />
                                            </button>
                                            {sortOptions.map((opt) => (
                                                <button key={opt.id} onClick={() => { setSortBy(opt.id); setIsSortOpen(false); }} style={{ padding: "13px 16px" }} className={cn("flex w-full items-center justify-between rounded-xl text-left text-sm transition-all duration-200", sortBy === opt.id ? "bg-gold/10 font-black text-gold" : "text-gray-300 hover:bg-white/5 hover:text-white")}>
                                                    {opt.label}
                                                    {sortBy === opt.id && <Check size={14} />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-32 overflow-hidden" style={{ borderRadius: "2px", border: "1px solid rgba(201,169,110,0.18)", background: "#101010" }}>
                            <FilterPanel />
                        </div>
                    </aside>

                    {loading ? (
                        <CollectionLoader variant="gallery" />
                    ) : (
                        <div className={cn(viewMode === "list" ? "gallery-product-list" : "gallery-product-grid", "gallery-grid-4")}>
                            {displayedProducts.length === 0 ? (
                                <div className="col-span-full rounded-3xl border border-white/10 bg-white/3 py-20 text-center text-gray-500">No products found for these filters.</div>
                            ) : (
                                displayedProducts.map((watch) => (
                                <div key={watch.id} className={cn("group cursor-pointer relative", viewMode === "list" ? "gallery-list-card" : "block")}>
                                    <Link href={`/product/${watch.name.toLowerCase().replace(/ /g, '-')}`} prefetch onMouseEnter={() => prefetchProduct(watch)} onTouchStart={() => prefetchProduct(watch)}>
                                        <div className="gallery-card-media relative overflow-hidden bg-dark-card rounded-lg aspect-[4/5] mb-4 border border-white/5">
                                            {watch.imageUrl ? (
                                                <GalleryProductImage src={watch.imageUrl} alt={watch.name} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/5"><span className="text-gray-600 text-xs">No Image</span></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                            <div style={{ position: "absolute", top: "16px", left: "0px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 10 }}>
                                                {watch.mode && watch.mode !== 'new' && (
                                                    <span style={{ backgroundColor: "#c9a96e", color: "black", fontSize: "10px", fontWeight: "bold", padding: "4px 8px 4px 12px", textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>{watch.mode}</span>
                                                )}
                                                {!watch.soldOut && watch.discount > 0 && (
                                                    <span style={{ backgroundColor: "#DC2626", color: "white", fontSize: "10px", fontWeight: "bold", padding: "4px 8px 4px 12px", textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>-{watch.discount}% OFF</span>
                                                )}
                                            </div>
                                            {watch.soldOut && (
                                                <div className="absolute top-2 right-2 z-20 pointer-events-none w-[100px] sm:w-[120px]"><img src="/sold-out-removebg-preview.png" alt="Sold Out" className="w-full h-auto drop-shadow-lg" /></div>
                                            )}
                                            <div className="absolute bottom-6 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20">
                                                <button style={{padding : "10px"}} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewProduct(watch); setSelectedQuickViewColor(watch.variants?.find((variant) => variant.available !== false && variant.images?.length)?.color || watch.variants?.[0]?.color || null); }} className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-gold hover:border-gold hover:text-black font-semibold text-[10px] tracking-[0.2em] uppercase px-8 py-3 rounded-full transition-all duration-300 shadow-xl">Quick View</button>
                                            </div>
                                        </div>
                                    </Link>
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(watch); }} className={`absolute top-6 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${isFavorite(watch.id) ? "bg-white/90 text-red-500 opacity-100" : "bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white/90 hover:text-red-500"}`}>
                                        <Heart size={18} fill={isFavorite(watch.id) ? "currentColor" : "none"} />
                                    </button>
                                    <Link href={`/product/${watch.name.toLowerCase().replace(/ /g, '-')}`} prefetch onMouseEnter={() => prefetchProduct(watch)} onTouchStart={() => prefetchProduct(watch)}>
                                        <h3 className="font-serif text-sm leading-tight text-white transition-colors duration-300 group-hover:text-gold sm:text-lg text-center">{watch.name}</h3>
                                        <div className="mt-1 flex items-center gap-2 justify-center">
                                            <span className="text-gold text-sm font-medium">Rs. {watch.price?.toLocaleString()}</span>
                                            {watch.discount > 0 && (
                                                <span className="text-gray-500 text-xs line-through opacity-70">Rs. {Math.round(watch.price / (1 - watch.discount / 100)).toLocaleString()}</span>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.button className="fixed inset-0 z-[95] bg-black/65 backdrop-blur-[2px] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterOpen(false)} />
                        <motion.aside className="fixed left-0 top-0 z-[100] h-dvh w-[86vw] max-w-sm overflow-hidden border-r border-white/10 bg-[#0f0f0f] shadow-2xl lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.34 }}>
                            <FilterPanel mobile />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {quickViewProduct && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
                    <div className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl relative flex flex-col md:flex-row">
                        <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur transition-colors"><X size={20} /></button>
                        <div className="w-full md:w-1/2 min-h-75 md:min-h-125 bg-dark relative flex items-center justify-center overflow-hidden">
                             <AnimatePresence mode="wait">
                                <motion.img key={selectedQuickViewColor || "default"} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} onLoadStart={() => setIsImageLoading(true)} onLoad={() => setIsImageLoading(false)} transition={{ duration: 0.5, ease: "easeOut" }} src={selectedQuickViewColor ? quickViewProduct.variants?.find(v => v.color === selectedQuickViewColor)?.images?.[0] || quickViewProduct.imageUrl : quickViewProduct.imageUrl} alt={quickViewProduct.name} className="object-cover w-full h-full absolute inset-0" />
                             </AnimatePresence>
                             {isImageLoading && (<div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 transition-opacity duration-300"><div className="skeleton-surface h-full w-full" /></div>)}
                             <div className="absolute inset-0 bg-linear-to-t from-dark/60 via-transparent to-transparent pointer-events-none" />
                        </div>
                        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#0a0a0a]">
                            <h2 className="font-serif text-3xl md:text-4xl text-white mb-2">{quickViewProduct.name}</h2>
                            <div className="mb-8 flex items-end gap-3">
                                <p className="text-xl md:text-2xl text-gold font-semibold">Rs. {quickViewProduct.price?.toLocaleString()}</p>
                                {quickViewProduct.discount > 0 && (<p className="text-lg text-gray-500 line-through mb-[2px] opacity-70">Rs. {Math.round(quickViewProduct.price / (1 - quickViewProduct.discount / 100)).toLocaleString()}</p>)}
                            </div>
                            {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                                <div className="mb-10">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest block mb-4">Color: <span className="text-white ml-2">{selectedQuickViewColor || "Select"}</span></span>
                                    <div className="flex gap-3">
                                        {quickViewProduct.variants.map((v) => (
                                            <button key={v.color} disabled={!v.images?.length} onClick={() => { if (v.images?.length && v.color !== selectedQuickViewColor) { setIsImageLoading(true); setSelectedQuickViewColor(v.color); } }} className={`w-10 h-10 rounded-full border-2 transition-all duration-300 relative flex items-center justify-center ${!v.images?.length ? "cursor-not-allowed opacity-40 after:absolute after:left-1 after:right-1 after:top-1/2 after:h-px after:-rotate-45 after:bg-white" : v.available === false ? "opacity-60 after:absolute after:left-1 after:right-1 after:top-1/2 after:h-px after:-rotate-45 after:bg-white" : ""} ${selectedQuickViewColor === v.color ? "border-gold scale-110 shadow-[0_0_15px_rgba(201,169,76,0.3)]" : "border-white/20 hover:border-white/50"}`} style={{ backgroundColor: v.hex }} title={v.color}>
                                                {selectedQuickViewColor === v.color && (<Check size={14} className={cn(v.color.toLowerCase() === 'white' ? 'text-black' : 'text-white')} />)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button onClick={() => { addToCart(quickViewProduct, 1, selectedQuickViewColor || quickViewProduct.variants?.[0]?.color || null); setQuickViewProduct(null); }} className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 mb-4 hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-gold/20">Add to Cart</button>
                            <Link href={`/product/${quickViewProduct.name.toLowerCase().replace(/ /g, '-')}`} className="text-center text-gray-400 hover:text-white text-[10px] uppercase tracking-[0.3em] transition-colors border-b border-white/10 hover:border-gold pb-1 self-center inline-block">View Full Details</Link>
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
            <Suspense fallback={<main className="pt-[120px] md:pt-[8.5vw] px-4 md:px-[2vw] pb-[3vw] min-h-screen bg-dark"><div className="w-full px-6 md:px-12 2xl:px-20 py-12 md:py-20"><CollectionLoader variant="gallery" /></div></main>}>
                <GalleryContent />
            </Suspense>
            <Footer />
        </>
    );
}

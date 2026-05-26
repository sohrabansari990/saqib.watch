"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { cacheProducts, getCachedCatalog, getNewestProducts } from "@/lib/productCache";
import { getProductHref } from "@/lib/productSlug";
import LogoLoop from "./LogoLoop";
import CircularGallery from "./CircularGallery";

const watchBrands = [
  "Patek Philippe", "Seastar", "Curren", "D-Ziner", "Audemars Piguet", "Skmei",
  "Pagani Design", "Naviforce", "Benyar", "Rolex", "Tissot", "Universal Point",
  "Rick", "Rado", "KWC", "Frank Muller", "Elegance", "Hublot", "Carter", "Citizen",
  "Megir"
];

const imageLogos = watchBrands.map(name => ({
  src: `/logos/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.svg`,
  alt: name,
  title: name
}));

const HOME_CRITICAL_READY_EVENT = "saqib:home-critical-ready";
const GALLERY_IMAGE_TIMEOUT_MS = 30000;

function markHomeCriticalReady() {
    if (typeof window === "undefined") return;

    window.__saqibHomeCriticalReady = true;
    window.dispatchEvent(new Event(HOME_CRITICAL_READY_EVENT));
}

function preloadImage(src) {
    return new Promise((resolve) => {
        if (!src || typeof window === "undefined") {
            resolve(false);
            return;
        }

        const img = new window.Image();
        let settled = false;

        const finish = (loaded) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeoutId);
            resolve(loaded);
        };

        const timeoutId = window.setTimeout(() => finish(false), GALLERY_IMAGE_TIMEOUT_MS);

        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        img.src = src;
    });
}

function WatchCard({ watch, index }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const router = useRouter();
    
    const productHref = getProductHref(watch);
    const prefetchProduct = () => {
        router.prefetch(productHref);
    };

    return (
        <Link
            href={productHref}
            prefetch
            onMouseEnter={prefetchProduct}
            onTouchStart={prefetchProduct}
            className="group cursor-pointer block h-full"
        >
            <div className="relative overflow-hidden bg-dark-card rounded-lg aspect-3/4 border border-white/5" style={{ marginBottom: "16px" }}>
                <div style={{ position: "absolute", top: "16px", left: "0px", zIndex: 20, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {watch.mode && watch.mode !== "new" && (
                        <span style={{ backgroundColor: "#c9a96e", color: "black", fontSize: "10px", fontWeight: "bold", padding: "4px 8px 4px 12px", textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                            {watch.mode}
                        </span>
                    )}
                    {!watch.soldOut && watch.discount > 0 && (
                        <span style={{ backgroundColor: "#DC2626", color: "white", fontSize: "10px", fontWeight: "bold", padding: "4px 8px 4px 12px", textTransform: "uppercase", letterSpacing: "0.05em", alignSelf: "flex-start", borderRadius: "0 4px 4px 0", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                            -{watch.discount}% OFF
                        </span>
                    )}
                </div>
                {watch.soldOut && (
                    <div className="absolute top-2 right-2 z-20 pointer-events-none w-[100px] sm:w-[120px]">
                        <Image src="/sold-out-removebg-preview.png" alt="Sold Out" width={120} height={120} className="w-full h-auto drop-shadow-lg" />
                    </div>
                )}

                {watch.imageUrl ? (
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                        <Image
                            src={watch.imageUrl}
                            alt={watch.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            loading={index < 4 ? "eager" : "lazy"}
                            quality={75}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageLoaded(true)}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                        <svg viewBox="0 0 200 300" className="w-3/4 h-3/4">
                            <rect x="70" y="10" width="60" height="80" rx="8" fill={watch.color || "#2a2a2a"} opacity="0.8" />
                            <rect x="75" y="15" width="50" height="70" rx="6" fill="none" stroke={watch.accent || "#c9a96e"} strokeWidth="0.5" opacity="0.3" />
                            <circle cx="100" cy="150" r="55" fill={watch.color || "#2a2a2a"} />
                            <circle cx="100" cy="150" r="52" fill="none" stroke={watch.accent || "#c9a96e"} strokeWidth="1.5" />
                            <circle cx="100" cy="150" r="44" fill="#0a0a0a" opacity="0.9" />
                        </svg>
                    </div>
                )}

                {!imageLoaded && watch.imageUrl && (
                    <div className="absolute inset-0 z-10 bg-[#111]">
                        <div className="skeleton-surface h-full w-full" />
                    </div>
                )}

                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" style={{ padding: "16px" }}>
                    <span className="text-xs tracking-[0.2em] text-gold uppercase">
                        View Details
                    </span>
                </div>
            </div>

            <h3 className="font-serif text-lg text-center text-white group-hover:text-gold transition-colors duration-300">
                {watch.name}
            </h3>

        </Link>
    );
}

export default function NewArrivals() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [catalogReady, setCatalogReady] = useState(false);
    const [galleryImagesReady, setGalleryImagesReady] = useState(false);
    const [galleryReady, setGalleryReady] = useState(false);
    const [galleryFailed, setGalleryFailed] = useState(false);
    const [readyGalleryProducts, setReadyGalleryProducts] = useState([]);
    const preloadKeyRef = useRef("");

    const galleryProducts = useMemo(
        () => products.filter((product) => product?.imageUrl).slice(0, 12),
        [products]
    );

    const galleryItems = useMemo(
        () => readyGalleryProducts.map((product) => ({
            id: product.id,
            image: product.imageUrl,
            text: product.name.split(" ").slice(0, 2).join(" "),
        })),
        [readyGalleryProducts]
    );

    const handleGalleryClick = useCallback((item) => {
        const product = products.find((candidate) => candidate.id === item.id);
        if (product) {
            window.location.href = getProductHref(product);
        }
    }, [products]);

    const handleGalleryReady = useCallback((status) => {
        setGalleryFailed(Boolean(status?.failed));
        setGalleryReady(true);
        markHomeCriticalReady();
    }, []);

    useEffect(() => {
        const cachedCatalog = getCachedCatalog();
        if (!cachedCatalog?.products?.length) {
            return;
        }

        setProducts(getNewestProducts(cachedCatalog.products.filter((product) => !product.soldOut && product.imageUrl), 12));
        setCatalogReady(true);
        setLoading(false);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (!db) {
                setCatalogReady(true);
                setLoading(false);
                return;
            }
            if (!getCachedCatalog()?.products?.length) {
                setLoading(true);
            }
            try {
                let q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(12));
                try {
                    const snap = await getDocs(q);
                    if (!isMounted) return;
                    const nextProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(p => !p.soldOut && p.imageUrl);
                    setProducts(nextProducts);
                    cacheProducts(nextProducts);
                } catch (e) {
                    const snap = await getDocs(query(collection(db, "products"), orderBy("name"), limit(12)));
                    if (!isMounted) return;
                    const nextProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(p => !p.soldOut && p.imageUrl);
                    setProducts(nextProducts);
                    cacheProducts(nextProducts);
                }
            } catch (err) {
                console.error("New arrivals load failed", err);
            } finally {
                if (isMounted) {
                    setCatalogReady(true);
                    setLoading(false);
                }
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (loading || !catalogReady) return;

        const galleryImages = galleryProducts.map((product) => product.imageUrl);
        const preloadKey = galleryImages.join("|") || "empty";

        if (preloadKeyRef.current === preloadKey) return;
        preloadKeyRef.current = preloadKey;

        if (galleryImages.length === 0) {
            setGalleryImagesReady(true);
            setGalleryReady(true);
            setGalleryFailed(false);
            markHomeCriticalReady();
            return;
        }

        let isActive = true;
        setGalleryImagesReady(false);
        setGalleryReady(false);
        setGalleryFailed(false);
        setReadyGalleryProducts([]);

        Promise.allSettled(galleryImages.map(preloadImage)).then((results) => {
            if (!isActive) return;
            const loadedProducts = galleryProducts.filter((_, index) => {
                const result = results[index];
                return result?.status === "fulfilled" && result.value;
            });

            if (loadedProducts.length === 0) {
                setGalleryImagesReady(true);
                setReadyGalleryProducts([]);
                setGalleryFailed(true);
                setGalleryReady(true);
                markHomeCriticalReady();
                return;
            }

            setReadyGalleryProducts(loadedProducts.slice(0, 6));
            setGalleryImagesReady(true);
        });

        return () => {
            isActive = false;
        };
    }, [catalogReady, galleryProducts, loading]);

    return (
        <section
            id="arrivals"
            ref={sectionRef}
            style={{
                width: "100%",
                padding: "20px 0",
                backgroundColor: "#000000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <div className="w-full">
                {/* Title removed from here and moved into CircularGallery overlay */}

                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ padding: "0vw 0vw 2vw 0vw" }}
                >
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: index * 0.06 }}
                                    className="group"
                                >
                                    <div className="relative overflow-hidden bg-dark-card rounded-lg aspect-3/4 border border-white/5" style={{ marginBottom: "16px" }}>
                                        <div className="skeleton-surface absolute inset-0" />
                                    </div>
                                    <div className="skeleton-surface rounded-full" style={{ margin: "0 auto", height: "16px", width: "80%" }} />
                                    <div className="skeleton-surface rounded-full" style={{ margin: "12px auto 0", height: "12px", width: "50%" }} />
                                </motion.div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">No products available yet.</div>
                    ) : (
                        <>
                            {/* 
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                spaceBetween={24}
                                slidesPerView={1}
                                navigation
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 3000, disableOnInteraction: false }}
                                breakpoints={{
                                    640: { slidesPerView: 2 },
                                    768: { slidesPerView: 3 },
                                    1024: { slidesPerView: 4 },
                                    1280: { slidesPerView: 5 },
                                    1600: { slidesPerView: 6 },
                                }}
                                style={{ padding: "0vw 0vw clamp(20px, 7vw, 40px) 0vw" }}
                            >
                                {products.map((watch, idx) => (
                                    <SwiperSlide key={watch.id}>
                                        <WatchCard watch={watch} index={idx} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            */}
                            
                            {/* Title Block Above Gallery */}
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: "40px",
                                    marginTop: "20px",
                                    position: "relative",
                                    zIndex: 20,
                                    padding: "0 2vw"
                                }}
                            >
                                <p className="text-gold tracking-[0.4em] text-xs uppercase" style={{ marginBottom: "12px" }}>
                                    Discover
                                </p>
                                <h2 className="font-serif text-4xl md:text-6xl text-white font-light">
                                    New Arrivals
                                </h2>
                                <div className="w-16 h-px bg-gold" style={{ marginTop: "24px", marginLeft: "auto", marginRight: "auto" }} />
                            </div>

                            <div
                                data-gallery-state={galleryFailed ? "fallback" : galleryReady ? "ready" : "loading"}
                                style={{ width: "100%", position: "relative", height: "clamp(280px, 45vh, 550px)", overflow: "hidden" }}
                            >
                                {galleryImagesReady && !galleryFailed && (
                                    <CircularGallery 
                                        items={galleryItems}
                                        onItemClick={handleGalleryClick}
                                        onReady={handleGalleryReady}
                                        bend={3} 
                                        textColor="#c9a96e" 
                                        font="bold 14px Georgia, serif"
                                        borderRadius={0.05} 
                                        scrollSpeed={1.8} 
                                        scrollEase={0.04} 
                                    />
                                )}
                                {galleryFailed && (
                                    <div
                                        style={{
                                            height: "100%",
                                            display: "grid",
                                            gridAutoFlow: "column",
                                            gridAutoColumns: "minmax(180px, 28vw)",
                                            gap: "18px",
                                            overflowX: "auto",
                                            padding: "6px 18px 18px",
                                            scrollSnapType: "x mandatory",
                                        }}
                                    >
                                        {products.slice(0, 6).map((watch, idx) => (
                                            <div key={watch.id} style={{ scrollSnapAlign: "center" }}>
                                                <WatchCard watch={watch} index={idx} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>

                {/* ── Brand Logo Loop — below the carousel ── */}
                <div style={{ width: "100%", marginTop: "40px", overflow: "hidden" }}>
                    <p style={{ textAlign: "center", color: "#c9a96e", letterSpacing: "0.4em", fontSize: "12px", textTransform: "uppercase", marginBottom: "24px", opacity: 0.6 }}>
                        Featured Brands
                    </p>
                    <LogoLoop
                        logos={imageLogos}
                        speed={80}
                        direction="left"
                        logoHeight={36}
                        gap={72}
                        hoverSpeed={20}
                        fadeOut
                        fadeOutColor="#000000"
                        ariaLabel="Featured watch brands"
                    />
                </div>

            </div>
        </section>
    );
}

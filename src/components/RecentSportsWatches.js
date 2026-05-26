"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCachedCatalog, sortProductsByNewest } from "@/lib/productCache";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getProductHref } from "@/lib/productSlug";
import { useCart } from "@/context/CartContext";

export default function RecentSportsWatches() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [screenSize, setScreenSize] = useState("large");
    const scrollContainerRef = useRef(null);
    const { addToCart } = useCart();

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const cachedCatalog = getCachedCatalog();
            if (cachedCatalog?.products?.length > 0) {
                let sportsProducts = cachedCatalog.products.filter(
                    (p) => p.category?.toLowerCase() === "sports" && p.imageUrl
                );
                sportsProducts = sortProductsByNewest(sportsProducts);
                if (sportsProducts.length > 0) {
                    setProducts(sportsProducts);
                    setLoading(false);
                }
            }

            if (!db) return;

            try {
                const q = query(collection(db, "products"), where("category", "==", "sports"));
                const snap = await getDocs(q);
                if (!isMounted) return;
                let nextProducts = snap.docs
                    .map((d) => ({ id: d.id, ...d.data() }))
                    .filter((p) => !p.soldOut && p.imageUrl);
                
                nextProducts = sortProductsByNewest(nextProducts);
                
                if (nextProducts.length > 0) {
                    setProducts(nextProducts);
                }
            } catch (err) {
                console.error("RecentSportsWatches load failed", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();

        const checkScreen = () => {
            const width = window.innerWidth;
            if (width < 768) setScreenSize("small");
            else if (width < 1024) setScreenSize("medium");
            else setScreenSize("large");
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);

        return () => {
            isMounted = false;
            window.removeEventListener("resize", checkScreen);
        };
    }, []);

    const isMobile = screenSize === "small";

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const firstCard = container.firstElementChild;
            if (firstCard) {
                const scrollAmount = firstCard.offsetWidth + 24; // card width + gap
                container.scrollBy({
                    left: direction === "left" ? -scrollAmount : scrollAmount,
                    behavior: "smooth"
                });
            }
        }
    };

    if (loading && products.length === 0) return null;
    if (products.length === 0) return null;

    return (
        <section
            style={{
                width: "100%",
                minHeight: "100vh",
                backgroundColor: "#000000",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "80px 0",
                overflow: "hidden",
            }}
        >
            <div style={{ padding: "0 5vw", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h2 style={{
                        fontFamily: "Georgia, serif",
                        color: "#ffffff",
                        fontSize: "clamp(2rem, 4vw, 3rem)",
                        fontWeight: "bold",
                        lineHeight: 1.2,
                        margin: 0
                    }}>
                        Sports Watches
                    </h2>
                </div>
                <div style={{ display: isMobile ? "none" : "flex", gap: "12px" }}>
                    <button 
                        onClick={() => scroll("left")}
                        style={{
                            width: "44px", height: "44px", borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.1)", border: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", cursor: "pointer", transition: "background 0.3s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(201,169,110,0.3)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => scroll("right")}
                        style={{
                            width: "44px", height: "44px", borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.1)", border: "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", cursor: "pointer", transition: "background 0.3s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(201,169,110,0.3)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <div style={{ padding: "0 5vw", paddingBottom: "20px" }}>
                <div 
                    ref={scrollContainerRef}
                    style={{
                        display: "flex",
                        overflowX: "auto",
                        scrollBehavior: "smooth",
                        scrollSnapType: "x mandatory",
                        gap: "24px",
                        WebkitOverflowScrolling: "touch",
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                    }}
                    className="hide-scrollbar"
                >
                {products.map((product) => {
                    const discountedPrice = product.discount > 0 
                        ? Math.round(product.price / (1 - product.discount / 100))
                        : null;
                    
                    const hoverImage = product.images?.find(img => img !== product.imageUrl) || null;

                    let cardWidth = "calc((100% - 120px) / 6)"; // large (6 cards)
                    if (screenSize === "small") cardWidth = "100%"; // 1 card
                    else if (screenSize === "medium") cardWidth = "calc((100% - 48px) / 3)"; // 3 cards

                    return (
                        <div 
                            key={product.id}
                            style={{
                                minWidth: cardWidth,
                                maxWidth: cardWidth,
                                flexShrink: 0,
                                scrollSnapAlign: screenSize === "small" ? "center" : "start",
                                backgroundColor: "#000000",
                                borderRadius: "8px",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                border: "1px solid rgba(201,169,110,0.3)"
                            }}
                        >
                            <Link href={getProductHref(product)} className="group" style={{ position: "relative", height: "300px", display: "block" }}>
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: "cover" }}
                                    sizes="280px"
                                    className={`transition-all duration-500 group-hover:scale-110 ${hoverImage ? 'group-hover:opacity-0' : ''}`}
                                />
                                {hoverImage && (
                                    <Image
                                        src={hoverImage}
                                        alt={`${product.name} alternate view`}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        sizes="280px"
                                        className="opacity-0 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                                    />
                                )}
                                {product.discount > 0 && (
                                    <span style={{
                                        position: "absolute", bottom: "12px", left: "12px",
                                        backgroundColor: "#c9a96e", color: "#000",
                                        fontSize: "12px", fontWeight: "bold",
                                        padding: "4px 10px", borderRadius: "4px"
                                    }}>
                                        Sale
                                    </span>
                                )}
                            </Link>
                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                <Link href={getProductHref(product)} style={{ textDecoration: "none", flexGrow: 1 }}>
                                    <h3 style={{
                                        color: "#fff", fontSize: "14px", fontWeight: "400",
                                        margin: "0 0 12px 0", lineHeight: "1.4"
                                    }}>
                                        {product.name}
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "20px" }}>
                                        {discountedPrice && (
                                            <span style={{ color: "#888", fontSize: "12px", textDecoration: "line-through" }}>
                                                Rs. {discountedPrice.toLocaleString()}
                                            </span>
                                        )}
                                        <span style={{ color: "#c9a96e", fontSize: "16px", fontWeight: "bold" }}>
                                            Rs. {product.price?.toLocaleString()}
                                        </span>
                                    </div>
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart(product, 1, product.variants?.find(v => v.available !== false && v.images?.length)?.color || product.variants?.[0]?.color || null);
                                    }}
                                    style={{
                                        width: "100%", padding: "12px",
                                        backgroundColor: "transparent", color: "#c9a96e",
                                        border: "1px solid #c9a96e",
                                        borderRadius: "4px", cursor: "pointer",
                                        fontSize: "12px", textTransform: "uppercase",
                                        letterSpacing: "0.05em", fontWeight: "bold",
                                        transition: "all 0.3s"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#c9a96e";
                                        e.currentTarget.style.color = "#000";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.color = "#c9a96e";
                                    }}
                                >
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>

            <div style={{ display: isMobile ? "flex" : "none", justifyContent: "center", gap: "12px", marginTop: "10px" }}>
                <button 
                    onClick={() => scroll("left")}
                    style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.1)", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", cursor: "pointer", transition: "background 0.3s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(201,169,110,0.3)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={() => scroll("right")}
                    style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.1)", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", cursor: "pointer", transition: "background 0.3s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(201,169,110,0.3)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                <Link
                    href="/gallery?category=sports"
                    style={{
                        color: "#fff", fontSize: "14px", textDecoration: "underline",
                        textUnderlineOffset: "4px", textTransform: "uppercase",
                        letterSpacing: "0.05em", fontWeight: "bold", opacity: 0.8,
                        transition: "opacity 0.3s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
                >
                    View all
                </Link>
            </div>
            
            {/* Inject global style to hide scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </section>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getProductHref } from "@/lib/productSlug";
import { useCart } from "@/context/CartContext";
import { getCachedCatalog, cacheCatalog, sortProductsByNewest } from "@/lib/productCache";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import { ArrowUpRight } from "lucide-react";

function BudgetWatchCard({ product }) {
    const { addToCart } = useCart();
    const discountedPrice = product.discount > 0 
        ? Math.round(product.price / (1 - product.discount / 100))
        : null;

    const hoverImage = product.images?.find(img => img !== product.imageUrl) || null;

    return (
        <div 
            style={{
                backgroundColor: "#000000",
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(201, 169, 110, 0.25)",
                transition: "transform 0.3s ease, border-color 0.3s ease",
                height: "100%"
            }}
            className="group hover:border-gold/50 hover:-translate-y-1"
        >
            <Link href={getProductHref(product)} className="relative block h-[180px] md:h-[220px] overflow-hidden">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="200px"
                    className="transition-transform duration-500 group-hover:scale-105"
                />
                {hoverImage && (
                    <Image
                        src={hoverImage}
                        alt={`${product.name} alternate`}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="200px"
                        className="opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                )}
                {product.discount > 0 && (
                    <span style={{
                        position: "absolute", bottom: "10px", left: "10px",
                        backgroundColor: "#c9a96e", color: "#000000",
                        fontSize: "10px", fontWeight: "bold",
                        padding: "3px 6px", borderRadius: "4px"
                    }}>
                        -{product.discount}%
                    </span>
                )}
            </Link>
            
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <Link href={getProductHref(product)} style={{ textDecoration: "none", flexGrow: 1 }}>
                    <h4 style={{
                        color: "#ffffff", fontSize: "13px", fontWeight: "400",
                        margin: "0 0 8px 0", lineHeight: "1.4",
                        fontFamily: "Georgia, serif"
                    }}>
                        {product.name}
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "12px" }}>
                        {discountedPrice && (
                            <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "11px", textDecoration: "line-through" }}>
                                Rs. {discountedPrice.toLocaleString()}
                            </span>
                        )}
                        <span style={{ color: "#c9a96e", fontSize: "14px", fontWeight: "bold" }}>
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
                        width: "100%", padding: "10px",
                        backgroundColor: "transparent", color: "#c9a96e",
                        border: "1px solid #c9a96e",
                        borderRadius: "6px", cursor: "pointer",
                        fontSize: "11px", textTransform: "uppercase",
                        letterSpacing: "0.05em", fontWeight: "bold",
                        transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#c9a96e";
                        e.currentTarget.style.color = "#000000";
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
}

export default function BudgetWatchesSection() {
    const [under10kProducts, setUnder10kProducts] = useState([]);
    const [under5kProducts, setUnder5kProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            const cachedCatalog = getCachedCatalog();
            if (cachedCatalog?.products?.length > 0) {
                const catalog = cachedCatalog.products.filter(p => !p.soldOut && p.imageUrl);
                const u10k = catalog.filter(p => Number(p.price) > 5000 && Number(p.price) <= 10000);
                const u5k = catalog.filter(p => Number(p.price) <= 5000);
                
                setUnder10kProducts(sortProductsByNewest(u10k).slice(0, 4));
                setUnder5kProducts(sortProductsByNewest(u5k).slice(0, 4));
                setLoading(false);
            }

            if (!db) return;

            try {
                const snap = await getDocs(collection(db, "products"));
                if (!isMounted) return;

                const allProducts = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                cacheCatalog(allProducts);

                const catalog = allProducts.filter(p => !p.soldOut && p.imageUrl);
                const u10k = catalog.filter(p => Number(p.price) > 5000 && Number(p.price) <= 10000);
                const u5k = catalog.filter(p => Number(p.price) <= 5000);

                setUnder10kProducts(sortProductsByNewest(u10k).slice(0, 4));
                setUnder5kProducts(sortProductsByNewest(u5k).slice(0, 4));
            } catch (err) {
                console.error("Failed to load budget watches:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading && under10kProducts.length === 0 && under5kProducts.length === 0) {
        return null;
    }

    return (
        <section 
            style={{
                width: "100%",
                backgroundColor: "#000000",
                padding: "0",
                marginBottom: "-100vh"
            }}
        >
            <ScrollStack 
                useWindowScroll={true}
                itemDistance={0}
                itemScale={0}
                itemStackDistance={0}
                stackPosition="80px"
                scaleEndPosition="80px"
                baseScale={1}
                blurAmount={0}
            >
                {/* Section 1: Under 10k */}
                {under10kProducts.length > 0 && (
                    <ScrollStackItem>
                        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", gap: "32px" }}>
                            {/* Card Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                                <div>
                                    <p className="hidden md:block" style={{ color: "#c9a96e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.3em", margin: "0 0 8px 0" }}>
                                        Curated Value
                                    </p>
                                    <h2 style={{
                                        fontFamily: "Georgia, serif",
                                        color: "#ffffff",
                                        fontSize: "clamp(2rem, 3.5vw, 3rem)",
                                        fontWeight: "bold",
                                        lineHeight: 1.2,
                                        margin: 0
                                    }}>
                                        Watches Under 10,000
                                    </h2>
                                </div>
                                <Link 
                                    href="/gallery?maxPrice=10000"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        color: "#c9a96e",
                                        textDecoration: "none",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        borderBottom: "1px solid transparent",
                                        paddingBottom: "2px",
                                        transition: "border-color 0.3s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#c9a96e"}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
                                >
                                    View All <ArrowUpRight size={16} />
                                </Link>
                            </div>

                            {/* Watches Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {under10kProducts.map((product, index) => (
                                    <div key={product.id} className={index >= 2 ? "hidden md:block" : "block"}>
                                        <BudgetWatchCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollStackItem>
                )}

                {/* Section 2: Under 5k */}
                {under5kProducts.length > 0 && (
                    <ScrollStackItem>
                        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", gap: "32px" }}>
                            {/* Card Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
                                <div>
                                    <p className="hidden md:block" style={{ color: "#c9a96e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.3em", margin: "0 0 8px 0" }}>
                                        Best Budget Finds
                                    </p>
                                    <h2 style={{
                                        fontFamily: "Georgia, serif",
                                        color: "#ffffff",
                                        fontSize: "clamp(2rem, 3.5vw, 3rem)",
                                        fontWeight: "bold",
                                        lineHeight: 1.2,
                                        margin: 0
                                    }}>
                                        Watches Under 5,000
                                    </h2>
                                </div>
                                <Link 
                                    href="/gallery?maxPrice=5000"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        color: "#c9a96e",
                                        textDecoration: "none",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        borderBottom: "1px solid transparent",
                                        paddingBottom: "2px",
                                        transition: "border-color 0.3s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#c9a96e"}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
                                >
                                    View All <ArrowUpRight size={16} />
                                </Link>
                            </div>

                            {/* Watches Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {under5kProducts.map((product, index) => (
                                    <div key={product.id} className={index >= 2 ? "hidden md:block" : "block"}>
                                        <BudgetWatchCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollStackItem>
                )}
            </ScrollStack>
        </section>
    );
}

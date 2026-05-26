"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionLoader from "@/components/CollectionLoader";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getProductHref } from "@/lib/productSlug";
import { useCart } from "@/context/CartContext";
import { getBrandById, getProductBrandId } from "@/lib/brandsConfig";
import { getCachedCatalog, cacheCatalog, sortProductsByNewest } from "@/lib/productCache";
import { Heart, ChevronLeft, ArrowLeft } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

export default function BrandPage() {
    const params = useParams();
    const router = useRouter();
    const brandId = params?.id;
    const brand = getBrandById(brandId);
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();

    useEffect(() => {
        if (!brand) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadProducts = async () => {
            // First load from sessionStorage cache for instant render
            const cachedCatalog = getCachedCatalog();
            if (cachedCatalog?.products?.length > 0) {
                const brandProducts = cachedCatalog.products.filter(
                    (p) => getProductBrandId(p) === brand.id
                );
                setProducts(sortProductsByNewest(brandProducts));
                setLoading(false);
            }

            if (!db) return;

            try {
                const snap = await getDocs(collection(db, "products"));
                if (!isMounted) return;

                const allProducts = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Update catalog cache
                cacheCatalog(allProducts);

                // Filter for this brand
                const brandProducts = allProducts.filter(
                    (p) => getProductBrandId(p) === brand.id && !p.soldOut && p.imageUrl
                );

                setProducts(sortProductsByNewest(brandProducts));
            } catch (err) {
                console.error("Failed to load products for brand:", brand.id, err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, [brandId, brand]);

    if (!brand) {
        return (
            <>
                <Header />
                <main style={{ 
                    minHeight: "100vh", 
                    backgroundColor: "#000000", 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: "#ffffff",
                    padding: "20px"
                }}>
                    <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", marginBottom: "16px" }}>Brand Not Found</h1>
                    <p style={{ color: "#888888", marginBottom: "24px" }}>The requested brand collection does not exist.</p>
                    <Link href="/" style={{
                        color: "#c9a96e",
                        textDecoration: "underline",
                        textUnderlineOffset: "4px"
                    }}>
                        Back to Home
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main style={{ 
                minHeight: "100vh", 
                backgroundColor: "#000000",
                color: "#ffffff",
                paddingTop: "120px",
                paddingBottom: "80px"
            }}>
                {/* Brand Hero / Header Section */}
                <div style={{
                    position: "relative",
                    width: "100%",
                    padding: "60px 5vw",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    background: "radial-gradient(circle at top, rgba(201, 169, 110, 0.08) 0%, transparent 70%)",
                }}>
                    {/* Back Button */}
                    <button 
                        onClick={() => router.push("/")}
                        style={{
                            position: "absolute",
                            left: "5vw",
                            top: "30px",
                            background: "transparent",
                            border: "none",
                            color: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "14px",
                            opacity: 0.7,
                            transition: "opacity 0.3s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>

                    {/* Logo container */}
                    <div style={{
                        width: "140px",
                        height: "80px",
                        position: "relative",
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                        marginBottom: "24px"
                    }}>
                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                            <Image
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                fill
                                sizes="140px"
                                style={{ objectFit: "contain" }}
                            />
                        </div>
                    </div>

                    <p style={{
                        color: "#c9a96e",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.4em",
                        margin: "0 0 12px 0"
                    }}>
                        Exclusive Collection
                    </p>

                    <h1 style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "clamp(2rem, 5vw, 3.5rem)",
                        fontWeight: "light",
                        margin: "0 0 16px 0",
                        letterSpacing: "0.02em"
                    }}>
                        {brand.name}
                    </h1>

                    <div style={{ width: "60px", height: "1px", backgroundColor: "#c9a96e", marginBottom: "20px" }} />

                    <p style={{
                        maxWidth: "600px",
                        fontSize: "15px",
                        color: "#888888",
                        lineHeight: "1.6",
                        margin: 0
                    }}>
                        Explore our curated selection of pristine timepieces from {brand.name}. Every watch is verified for authenticity, offering exceptional craftsmanship and distinction.
                    </p>
                </div>

                {/* Products Grid Section */}
                <div style={{ padding: "40px 5vw", maxWidth: "1400px", margin: "0 auto" }}>
                    {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
                            <CollectionLoader />
                        </div>
                    ) : products.length > 0 ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "32px"
                        }}>
                            {products.map((product) => {
                                const discountedPrice = product.discount > 0 
                                    ? Math.round(product.price / (1 - product.discount / 100))
                                    : null;
                                
                                const hoverImage = product.images?.find(img => img !== product.imageUrl) || null;

                                return (
                                    <div 
                                        key={product.id}
                                        style={{
                                            backgroundColor: "rgba(255, 255, 255, 0.02)",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            display: "flex",
                                            flexDirection: "column",
                                            border: "1px solid rgba(201, 169, 110, 0.2)",
                                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                            position: "relative"
                                        }}
                                        className="group hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(201,169,110,0.1)]"
                                    >
                                        {/* Favorite Button */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleFavorite(product);
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: "16px",
                                                right: "16px",
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                zIndex: 10,
                                                color: isFavorite(product.id) ? "#ef4444" : "#ffffff",
                                                transition: "all 0.3s ease"
                                            }}
                                        >
                                            <Heart size={18} fill={isFavorite(product.id) ? "#ef4444" : "none"} />
                                        </button>

                                        {/* Product Image */}
                                        <Link href={getProductHref(product)} style={{ position: "relative", height: "320px", display: "block" }}>
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                fill
                                                style={{ objectFit: "cover" }}
                                                sizes="300px"
                                                className="transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {hoverImage && (
                                                <Image
                                                    src={hoverImage}
                                                    alt={`${product.name} alternate view`}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                    sizes="300px"
                                                    className="opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                                                />
                                            )}
                                            {product.discount > 0 && (
                                                <span style={{
                                                    position: "absolute", bottom: "16px", left: "16px",
                                                    backgroundColor: "#c9a96e", color: "#000000",
                                                    fontSize: "11px", fontWeight: "bold",
                                                    padding: "4px 8px", borderRadius: "4px",
                                                    textTransform: "uppercase"
                                                }}>
                                                    Sale -{product.discount}%
                                                </span>
                                            )}
                                        </Link>

                                        {/* Details */}
                                        <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                            <Link href={getProductHref(product)} style={{ textDecoration: "none", flexGrow: 1 }}>
                                                <h3 style={{
                                                    color: "#ffffff", fontSize: "16px", fontWeight: "400",
                                                    margin: "0 0 10px 0", lineHeight: "1.4",
                                                    fontFamily: "Georgia, serif"
                                                }}>
                                                    {product.name}
                                                </h3>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "20px" }}>
                                                    {discountedPrice && (
                                                        <span style={{ color: "#666666", fontSize: "12px", textDecoration: "line-through" }}>
                                                            Rs. {discountedPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                    <span style={{ color: "#c9a96e", fontSize: "18px", fontWeight: "bold" }}>
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
                                                    width: "100%", padding: "14px",
                                                    backgroundColor: "transparent", color: "#c9a96e",
                                                    border: "1px solid #c9a96e",
                                                    borderRadius: "6px", cursor: "pointer",
                                                    fontSize: "12px", textTransform: "uppercase",
                                                    letterSpacing: "0.08em", fontWeight: "bold",
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
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "100px 20px" }}>
                            <p style={{ color: "#888888", fontSize: "18px", marginBottom: "24px" }}>
                                No timepieces are currently available in the {brand.name} collection.
                            </p>
                            <Link href="/" style={{
                                color: "#c9a96e",
                                textDecoration: "underline",
                                textUnderlineOffset: "4px"
                            }}>
                                Discover other collections
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

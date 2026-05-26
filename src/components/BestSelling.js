"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Stack from "./ui/Stack";
import { getCachedCatalog } from "@/lib/productCache";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function BestSelling() {
    const [products, setProducts] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [h3Highlighted, setH3Highlighted] = useState(false);
    const [h2Highlighted, setH2Highlighted] = useState(false);
    const sectionRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const cachedCatalog = getCachedCatalog();
            if (cachedCatalog?.products?.length > 0) {
                const fetchedProducts = cachedCatalog.products
                    .filter(p => p.imageUrl && p.isBestSeller)
                    .slice(0, 4);
                if (fetchedProducts.length > 0) {
                    setProducts(fetchedProducts);
                }
            }

            if (!db) return;

            try {
                const q = query(collection(db, "products"), where("isBestSeller", "==", true), limit(10));
                const snap = await getDocs(q);
                if (!isMounted) return;
                const nextProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(p => !p.soldOut && p.imageUrl);
                if (nextProducts.length > 0) {
                    setProducts(nextProducts.slice(0, 4));
                }
            } catch (err) {
                console.error("BestSelling load failed", err);
            }
        };
        load();
        
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        
        return () => { 
            isMounted = false; 
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    // Scroll-driven text highlight — tied to parallax visible window
    // BestSelling is inside a 400vh wrapper at doc-top 0.
    // The 200vh overlay clears at scrollY >= 2*vh → section becomes visible.
    // Section unpins at scrollY >= 3*vh. So visible window = [2*vh, 3*vh].
    useEffect(() => {
        const handleScroll = () => {
            const vh = window.innerHeight;
            const visibleStart = 2 * vh;
            const visibleEnd = 3 * vh;
            const scrollY = window.scrollY;

            if (scrollY < visibleStart) {
                // Haven't reached section yet — reset both highlights
                setH3Highlighted(false);
                setH2Highlighted(false);
            } else if (scrollY >= visibleStart && scrollY <= visibleEnd) {
                // Inside the visible pin window — fire highlights progressively
                const progress = (scrollY - visibleStart) / (visibleEnd - visibleStart);
                setH3Highlighted(progress > 0.12);
                setH2Highlighted(progress > 0.38);
            }
            // scrollY > visibleEnd: section has scrolled away, leave highlights as-is
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        // Run once on mount in case user refreshed mid-page
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const defaultProducts = [
        { id: "1", imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=500&auto=format" },
        { id: "2", imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=500&auto=format" },
        { id: "3", imageUrl: "https://images.unsplash.com/photo-1542496658-e3267894cb97?q=80&w=500&auto=format" },
        { id: "4", imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=500&auto=format" }
    ];

    const displayProducts = products.length > 0 ? products : defaultProducts;

    // Shared style for both text highlight spans
    const highlightSpanStyle = (active, delay = 0) => ({
        display: "inline",
        backgroundImage: "linear-gradient(to right, rgba(201,169,110,0.45), rgba(201,169,110,0.45))",
        backgroundSize: active ? "100% 100%" : "0% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        transition: `background-size 0.85s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
        padding: "0 4px",
    });

    return (
        <section
            ref={sectionRef}
            style={{
                width: "100%",
                minHeight: "100vh",
                backgroundColor: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                paddingLeft: "5vw",
                paddingRight: "5vw",
                paddingTop: isMobile ? "140px" : "120px",
                paddingBottom: isMobile ? "80px" : "120px",
            }}
        >
            <div style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                width: "100%",
                maxWidth: "1200px",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "40px"
            }}>
                {/* Left Side: Stack Component */}
                <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: isMobile ? "260px" : "400px", height: isMobile ? "350px" : "550px", maxWidth: "100%" }}>
                        <Stack
                            randomRotation
                            sensitivity={220}
                            sendToBackOnClick={false}
                            cards={displayProducts.map((product, i) => (
                                <div 
                                    key={i} 
                                    style={{ width: "100%", height: "100%", cursor: "pointer" }}
                                    onClick={() => router.push(`/product/${product.id}`)}
                                >
                                    <img
                                        src={product.imageUrl}
                                        alt={`best-selling-${i}`}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                                    />
                                </div>
                            ))}
                            autoplay
                            pauseOnHover
                        />
                    </div>
                </div>

                {/* Right Side: Text & Info */}
                <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h3 style={{
                        fontFamily: "'Dancing Script', cursive, serif",
                        color: "#c9a96e",
                        fontSize: isMobile ? "2rem" : "2.5rem",
                        margin: 0,
                        lineHeight: 1.4,
                    }}>
                        <span style={highlightSpanStyle(h3Highlighted)}>
                            Our Top Selling Watches
                        </span>
                    </h3>
                    <h2 style={{
                        fontFamily: "Georgia, serif",
                        color: "#ffffff",
                        fontSize: isMobile ? "2.2rem" : "clamp(2rem, 4vw, 3.5rem)",
                        fontWeight: "bold",
                        lineHeight: 1.3,
                        margin: 0,
                    }}>
                        <span style={highlightSpanStyle(h2Highlighted)}>
                            A Legacy on Your Wrist
                        </span>
                    </h2>
                    <Link
                        href="/gallery?category=best-selling-products"
                        style={{
                            display: "inline-block",
                            backgroundColor: "#c9a96e",
                            color: "#000000",
                            padding: "12px 24px",
                            fontWeight: "bold",
                            borderRadius: "4px",
                            textDecoration: "none",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontSize: "0.8rem",
                            width: "fit-content",
                            marginTop: "10px"
                        }}
                    >
                        Shop Best Selling Products
                    </Link>
                </div>
            </div>
        </section>
    );
}

"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BRANDS } from "@/lib/brandsConfig";

function BrandCard({ brand }) {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        
        // Calculate normalized mouse positions (-0.5 to 0.5)
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        // Max tilt angle of 15 degrees
        setTilt({ x: x * 15, y: -y * 15 });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
    };

    return (
        <Link
            href={`/brand/${brand.id}`}
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "16px",
                padding: "24px",
                height: "180px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${isHovered ? 1.05 : 1})`,
                boxShadow: isHovered 
                    ? "0 10px 30px -10px rgba(201, 169, 110, 0.25), inset 0 1px 1px rgba(255,255,255,0.1)"
                    : "0 4px 20px -15px rgba(0,0,0,0.5)",
                textDecoration: "none"
            }}
        >
            {/* Glowing spot matching mouse/hover */}
            <div 
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(201, 169, 110, 0.08) 0%, transparent 70%)",
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.4s ease",
                    pointerEvents: "none"
                }}
            />

            {/* Glowing border outline */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    border: "1px solid #c9a96e",
                    borderRadius: "16px",
                    opacity: isHovered ? 0.4 : 0,
                    transition: "opacity 0.4s ease",
                    pointerEvents: "none"
                }}
            />

            {/* Logo Container */}
            <div 
                style={{
                    width: "120px",
                    height: "70px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "8px",
                    boxShadow: isHovered 
                        ? "0 8px 20px rgba(201, 169, 110, 0.2)"
                        : "0 4px 10px rgba(0,0,0,0.3)",
                    transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    transform: isHovered ? "scale(1.08)" : "scale(1)",
                }}
            >
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <Image
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        fill
                        sizes="100px"
                        style={{
                            objectFit: "contain",
                        }}
                    />
                </div>
            </div>

            {/* Brand Name */}
            <span
                style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "14px",
                    color: isHovered ? "#c9a96e" : "#ffffff",
                    fontWeight: "500",
                    letterSpacing: "0.05em",
                    textAlign: "center",
                    transition: "color 0.3s ease",
                }}
            >
                {brand.name}
            </span>
        </Link>
    );
}

export default function BrandsSection() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                width: "100%",
                backgroundColor: "#000000",
                padding: "100px 5vw",
                overflow: "hidden",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            }}
        >
            <div 
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(40px)",
                    transition: "opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                {/* Section Header */}
                <div 
                    style={{
                        textAlign: "center",
                        marginBottom: "60px",
                    }}
                >
                    <h2 
                        style={{
                            fontFamily: "Georgia, serif",
                            color: "#ffffff",
                            fontSize: "clamp(2rem, 4vw, 3rem)",
                            fontWeight: "bold",
                            lineHeight: 1.2,
                            margin: "0 0 16px 0"
                        }}
                    >
                        Shop By Brand
                    </h2>
                    <p
                        style={{
                            fontFamily: "inherit",
                            color: "#888888",
                            fontSize: "clamp(14px, 1.2vw, 16px)",
                            maxWidth: "600px",
                            margin: "0 auto",
                            lineHeight: 1.6,
                        }}
                    >
                        Explore curated collections from the world's most prestigious horological houses. Click on any house to discover their legendary designs.
                    </p>
                </div>

                {/* Brands Grid */}
                <div 
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "24px",
                    }}
                >
                    {BRANDS.map((brand, idx) => (
                        <div
                            key={brand.id}
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                                transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s`
                            }}
                        >
                            <BrandCard brand={brand} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

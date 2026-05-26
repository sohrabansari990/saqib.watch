"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const TESTIMONIAL_IMAGES = [
    "/testimonials/IMG_7555.webp",
    "/testimonials/IMG_7556.webp",
    "/testimonials/IMG_7557.webp",
    "/testimonials/IMG_7559.webp",
    "/testimonials/IMG_7560.webp",
    "/testimonials/IMG_7561.webp",
    "/testimonials/WhatsApp Image 2026-05-25 43.jpeg",
    "/testimonials/WhatsApp Image 2026-05-25 at 2.41.47 PM.jpeg",
    "/testimonials/WhatsApp Image 2026-05.jpeg",
    "/testimonials/WhatsApp_Image_2024-06-05_at_10.45.13_PM.webp",
    "/testimonials/WhatsApp_Image_2024-06-05_at_10.45.16_PM.avif",
];

function ImageSlide({ src, index, total, scrollYProgress }) {
    const segmentSize = 1 / total;
    const start = index * segmentSize;
    const fadeInEnd = start + segmentSize * 0.15;
    const fadeOutStart = start + segmentSize * 0.85;
    const end = (index + 1) * segmentSize;

    const opacity = useTransform(scrollYProgress, (v) => {
        if (index === 0 && v <= fadeInEnd) return 1;
        if (index === total - 1 && v >= fadeOutStart) return 1;
        if (v < start) return 0;
        if (v >= start && v < fadeInEnd) return (v - start) / (fadeInEnd - start);
        if (v >= fadeInEnd && v <= fadeOutStart) return 1;
        if (v > fadeOutStart && v <= end) return 1 - (v - fadeOutStart) / (end - fadeOutStart);
        return 0;
    });

    return (
        <motion.div style={{ position: "absolute", inset: 0, opacity }}>
            <Image
                src={src}
                alt={`Customer feedback ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 220px, 280px"
                quality={85}
                priority={index < 2}
            />
        </motion.div>
    );
}

export default function TestimonialsSection() {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    // Translate the text wrapper up by 100vh over the course of the 200vh scroll
    const textY = useTransform(scrollYProgress, [0, 1], ["0vh", "-100vh"]);

    // Calculate current feedback image index for the counter
    const counterText = useTransform(scrollYProgress, (v) => {
        const idx = Math.min(
            TESTIMONIAL_IMAGES.length - 1,
            Math.floor(v * TESTIMONIAL_IMAGES.length)
        );
        return `${String(idx + 1).padStart(2, "0")} / ${TESTIMONIAL_IMAGES.length}`;
    });

    const stats = [
        { value: "500+", label: "WATCHES SOLD" },
        { value: "20+", label: "CITIES DELIVERED" },
        { value: "31K+", label: "INSTAGRAM FOLLOWERS" },
        { value: "4", label: "CATEGORIES" },
    ];

    const valueProps = [
        "100% VERIFIED AUTHENTIC",
        "SECURE EXPRESS SHIPPING",
        "5-STAR CUSTOMER SERVICE",
        "PERSONAL CHAMPION CURATED",
    ];

    return (
        <section
            ref={sectionRef}
            style={{
                position: "relative",
                height: "200vh",
                backgroundColor: "#000000",
                overflow: "clip",
            }}
        >
            <style>{`
                .t-viewport {
                    position: sticky;
                    top: 0;
                    height: 100vh;
                    width: 100%;
                    overflow: hidden;
                }
                .t-text-container {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    pointer-events: none;
                }
                .t-section {
                    height: 100vh;
                    width: 100%;
                    display: flex;
                    box-sizing: border-box;
                }
                .t-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                }
                .t-left-col {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 0 40px;
                }
                .t-center-spacer {
                    display: none;
                }
                .t-right-col {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 0 40px;
                }
                .t-card-wrapper {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    pointer-events: none;
                }
                .t-card-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .t-card {
                    width: 220px;
                    height: 310px;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 2px solid rgba(201, 169, 110, 0.6);
                    box-shadow: 0 25px 80px rgba(0,0,0,0.95), 0 0 60px rgba(201,169,110,0.15);
                    position: relative;
                    background-color: #0d0d0d;
                }
                .t-label {
                    color: #c9a96e;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.4em;
                    margin-bottom: 12px;
                }
                .t-title {
                    font-family: var(--font-cormorant-garamond), Georgia, serif;
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: 300;
                    line-height: 1.2;
                    margin: 0 0 16px 0;
                }
                .t-desc {
                    color: #a0a0a0;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0;
                    max-width: 100%;
                }
                .t-divider {
                    width: 60px;
                    height: 1px;
                    background-color: rgba(201, 169, 110, 0.4);
                    margin: 12px 0 20px 0;
                }
                .t-stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    width: 100%;
                }
                .t-stat-card {
                    text-align: left;
                }
                .t-stat-val {
                    font-family: var(--font-cormorant-garamond), Georgia, serif;
                    font-size: 36px;
                    color: #c9a96e;
                    line-height: 1;
                    margin-bottom: 4px;
                }
                .t-stat-lbl {
                    color: #8c8c8c;
                    font-size: 9px;
                    letter-spacing: 0.15em;
                }
                .t-props-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .t-prop-item {
                    color: #e0e0e0;
                    font-size: 11px;
                    letter-spacing: 0.15em;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .t-prop-bullet {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background-color: #c9a96e;
                    display: inline-block;
                }
                .t-bg-outlined-text {
                    font-family: var(--font-cormorant-garamond), Georgia, serif;
                    font-size: 72px;
                    font-weight: 700;
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.08);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    line-height: 1;
                }

                /* Mobile Layout Tuning (Scroll content around/behind card) */
                @media (max-width: 767px) {
                    .t-section-one {
                        padding-top: clamp(40px, 8vh, 80px);
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: center;
                        text-align: center;
                    }
                    .t-section-one .t-left-col {
                        padding: 0 24px;
                        align-items: center;
                    }
                    .t-section-one .t-desc {
                        font-size: 13px;
                        max-width: 320px;
                    }
                    .t-section-one .t-right-col {
                        display: none;
                    }
                    .t-section-two {
                        padding-bottom: clamp(40px, 8vh, 80px);
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;
                        align-items: center;
                        text-align: center;
                    }
                    .t-section-two .t-left-col {
                        display: none;
                    }
                    .t-section-two .t-right-col {
                        padding: 0 24px;
                        align-items: center;
                        width: 100%;
                    }
                    .t-section-two .t-stats-grid {
                        max-width: 320px;
                        margin: 0 auto;
                        gap: 16px;
                    }
                    .t-section-two .t-stat-card {
                        text-align: center;
                    }
                    .t-section-two .t-stat-val {
                        font-size: 28px;
                    }
                }

                /* Desktop Layout (3 Columns side-by-side) */
                @media (min-width: 768px) {
                    .t-card {
                        width: 280px;
                        height: 400px;
                    }
                    .t-grid {
                        grid-template-columns: 38% 24% 38%;
                        padding: 0 5vw;
                    }
                    .t-center-spacer {
                        display: block;
                    }
                    .t-left-col {
                        padding: 0 2vw;
                    }
                    .t-right-col {
                        padding: 0 2vw;
                    }
                    .t-title {
                        font-size: clamp(36px, 4vw, 54px);
                    }
                    .t-desc {
                        font-size: clamp(14px, 1.2vw, 17px);
                        max-width: 90%;
                    }
                    .t-stat-val {
                        font-size: clamp(40px, 4.5vw, 64px);
                    }
                    .t-bg-outlined-text {
                        font-size: clamp(80px, 8vw, 130px);
                    }
                }
            `}</style>

            {/* Sticky Container */}
            <div className="t-viewport">
                {/* Scrolling text columns in the background */}
                <motion.div
                    className="t-text-container"
                    style={{ y: textY }}
                >
                    {/* Page 1: Brand & Narrative */}
                    <div className="t-section t-section-one">
                        <div className="t-grid">
                            {/* Left Panel: The story */}
                            <div className="t-left-col">
                                <span className="t-label">THE BRAND / HERITAGE</span>
                                <h3 className="t-title">Precision Meets Passion</h3>
                                <div className="t-divider" />
                                <p className="t-desc">
                                    Saqib was born from a champion's obsession with quality.
                                    Every timepiece in our collection is handpicked for its craftsmanship,
                                    authenticity, and style; curated by someone who understands what
                                    it means to pursue excellence.
                                </p>
                            </div>

                            {/* Center Spacer */}
                            <div className="t-center-spacer" />

                            {/* Right Panel: Branded graphics / tagline */}
                            <div className="t-right-col" style={{ alignItems: "flex-end", textAlign: "right" }}>
                                <span className="t-label" style={{ color: "rgba(201, 169, 110, 0.4)" }}>ESTABLISHED 2026</span>
                                <div className="t-bg-outlined-text" style={{ marginRight: "-2vw" }}>
                                    SAQIB WATCHES
                                </div>
                                <span 
                                    className="t-label" 
                                    style={{ 
                                        marginTop: "16px",
                                        letterSpacing: "0.6em", 
                                        color: "#ffffff",
                                        fontSize: "10px"
                                    }}
                                >
                                    CURATED EXCELLENCE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Page 2: Stats & Testimonials info */}
                    <div className="t-section t-section-two">
                        <div className="t-grid">
                            {/* Left Panel: Stats grid */}
                            <div className="t-left-col">
                                <span className="t-label">OUR STATS</span>
                                <h3 className="t-title" style={{ fontSize: "28px", marginBottom: "30px" }}>Milestones</h3>
                                <div className="t-stats-grid">
                                    {stats.map((stat, idx) => (
                                        <div className="t-stat-card" key={idx}>
                                            <div className="t-stat-val">{stat.value}</div>
                                            <div className="t-stat-lbl">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Center Spacer */}
                            <div className="t-center-spacer" />

                            {/* Right Panel: Value propositions and ratings */}
                            <div className="t-right-col" style={{ alignItems: "flex-end", textAlign: "right" }}>
                                <span className="t-label">CUSTOMER STORIES</span>
                                <h3 className="t-title">What They Say</h3>
                                <div className="t-divider" style={{ marginLeft: "auto", marginRight: 0 }} />
                                <ul className="t-props-list">
                                    {valueProps.map((prop, idx) => (
                                        <li className="t-prop-item" key={idx} style={{ flexDirection: "row-reverse" }}>
                                            <span className="t-prop-bullet" />
                                            {prop}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sticky central card wrapper */}
                <div className="t-card-wrapper">
                    <div className="t-card-container">
                        {/* Image Card */}
                        <div className="t-card">
                            {TESTIMONIAL_IMAGES.map((src, i) => (
                                <ImageSlide
                                    key={src}
                                    src={src}
                                    index={i}
                                    total={TESTIMONIAL_IMAGES.length}
                                    scrollYProgress={scrollYProgress}
                                />
                            ))}
                        </div>

                        {/* Counter Display */}
                        <motion.span
                            style={{
                                color: "#c9a96e",
                                fontSize: "12px",
                                letterSpacing: "0.3em",
                                fontFamily: "Georgia, serif",
                                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                            }}
                        >
                            {counterText}
                        </motion.span>
                    </div>
                </div>
            </div>
        </section>
    );
}
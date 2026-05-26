"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import VideoModal from "@/components/VideoModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaPlay } from "react-icons/fa";

const INTRO_VIDEO_URL = "/saqib_into.mp4";
const HERO_WATCH_RENDER = "/hero-watch-case.webp";

/**
 * WRK-style hero animation breakdown:
 *  1. Initial tilt  →  rotate(-30deg) scale(1.3)  — pure 2D, right side UP
 *  2. Scroll leveling → rotate(0deg) scale(1.0) by ~75% of hero scroll
 *  3. Curtain reveal → hero z:10, next section z:9 so it appears from behind as hero lifts
 */
export default function HeroSection() {
    const heroRef = useRef(null);
    const router = useRouter();
    const [videoOpen, setVideoOpen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    // Track scroll progress of the hero section itself (0 = hero at top, 1 = hero fully scrolled away)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    // ── WRK-accurate transforms ───────────────────────────────────────────────
    //  • Pure 2D rotate: -30° (right side UP) → 0° (flat) — levels by 75% scroll
    //  • Scale:  1.25 (start) → 1.4 (zooms in slightly as it levels, matching WRK)
    //  • Subtle Y drift downward (0 -> 40) to center dial dynamically as it scales
    //  • Opacity lifts slightly as watch becomes flat and "legible"
    //  • Pure 2D rotate: -30° (right side UP) → -8° (not completely normal)
    //  • Scale:  1.3 (start) → 1.65 (zooms in noticeably)
    //  • Y drift: 0 -> 80 (centers down)
    const watchRotate  = useTransform(scrollYProgress, [0, 0.75], [-30, -8]);
    const watchScale   = useTransform(scrollYProgress, [0, 0.75], [1.3, 1.65]);
    const watchY       = useTransform(scrollYProgress, [0, 0.95], [0,  80]);
    const watchOpacity = useTransform(scrollYProgress, [0, 0.9],  [0.85, 1.0]);

    useEffect(() => {
        router.prefetch("/gallery");
    }, [router]);

    return (
        <section
            ref={heroRef}
            id="hero"
            className="relative w-full h-screen overflow-hidden flex items-center justify-center"
            /* z-10 keeps the hero "curtain" on top of the next section (z-9) */
            style={{ zIndex: 10 }}
        >
            {/* ── Dark background — purely black ── */}
            <div className="absolute inset-0 z-0 bg-black">
                {/* ── Watch image — WRK style pure-2D rotate+scale ──────── */}
                <motion.div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[50%] md:top-[62%] -translate-x-1/2 -translate-y-1/2 w-[145vw] sm:w-[118vw] md:w-[96vw] max-w-[1680px] flex items-center justify-center"
                    style={{
                        // Y drift is on the wrapper so it doesn't fight the rotate origin
                        y: prefersReducedMotion ? 0 : watchY,
                    }}
                >
                    <motion.img
                        src={HERO_WATCH_RENDER}
                        alt=""
                        className="block w-full select-none object-contain"
                        draggable="false"
                        style={{
                            // ── THE KEY FIX ──────────────────────────────────────────
                            // WRK uses pure 2D: rotate(-30deg) scale(1.25) at rest,
                            // then levels to rotate(0) scale(1.45) (zooming in!) as hero scrolls away.
                            // NO rotateX, NO perspective — just flat 2D like WRK.
                            rotate:  prefersReducedMotion ? 0 : watchRotate,
                            scale:   prefersReducedMotion ? 1 : watchScale,
                            opacity: prefersReducedMotion ? 0.95 : watchOpacity,
                            // Center-based transform origin matches WRK (no translation in their matrix)
                            transformOrigin: "50% 50%",
                            willChange: "transform, opacity",
                        }}
                    />
                </motion.div>
            </div>

            {/* ── Hero text content ───────────────────────────────────────── */}
            <div className="relative z-20 text-center px-6 flex flex-col items-center justify-center">
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-light tracking-wide leading-tight"
                >
                    Worn by Champions.
                    <br />
                    <span className="text-gold">Saqib</span> Watches
                </motion.h1>

                {/* <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-6 text-gray-muted text-sm md:text-base tracking-widest max-w-lg mx-10"
                >
                    Curated by Pakistan&apos;s Physique Champion. Built for everyone who values precision.
                </motion.p> */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/gallery"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "1.5rem",
                            padding: "1.25rem 3rem",
                            background: "#C9A94C",
                            border: "1px solid #C9A94C",
                            color: "black",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.4em",
                            fontSize: "0.75rem",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.5s cubic-bezier(0.19, 1, 0.22, 1)",
                            boxShadow: "0 0 20px rgba(201,169,76,0.1)",
                        }}
                        className="group  text-white hover:text-black hidden sm:inline-flex"
                    >
                        <span className="relative z-10 group-hover:text-black">Shope Now</span>
                        <FaArrowRight className="relative z-10 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-black" />
                        <div
                            className="absolute inset-0 bg-gold translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                            style={{ zIndex: 0 }}
                        />
                    </Link>

                    {/* <button
                        onClick={() => setVideoOpen(true)}
                        style={{ padding: "15px" }}
                        className="group relative inline-flex items-center gap-4 px-6 sm:px-8 py-3 sm:py-[1.15rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-gold/30 transition-all duration-500 cursor-pointer"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gold text-gold group-hover:bg-gold group-hover:text-black transition-colors duration-500 relative shrink-0">
                            <FaPlay className="text-[10px] ml-0.5" />
                            <div className="absolute inset-0 rounded-full border border-gold animate-ping opacity-30 group-hover:opacity-0 transition-opacity duration-300" />
                        </div>
                        <span className="text-white text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-semibold">
                            Full Experience
                        </span>
                    </button> */}
                </motion.div>
            </div>

            {/* ── Video modal ─────────────────────────────────────────────── */}
            <VideoModal
                isOpen={videoOpen}
                onClose={() => setVideoOpen(false)}
                videoUrl={INTRO_VIDEO_URL}
            />

            {/* ── Scroll indicator ────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
            >
                <span className="text-gray-muted text-xs tracking-[0.3em] uppercase">Scroll</span>
                <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
            </motion.div>
        </section>
    );
}

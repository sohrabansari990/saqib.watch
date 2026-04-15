"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import VideoModal from "@/components/VideoModal";

const INTRO_VIDEO_URL = "/Intro.mp4";

export default function HeroSection() {
    const heroRef = useRef(null);
    const [offset, setOffset] = useState(0);
    const [videoOpen, setVideoOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            if (heroRef.current) {
                setOffset(window.scrollY * 0.4);
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative w-full h-screen overflow-hidden flex items-center justify-center"
        >
            {/* Background Video / Animated Gradient Fallback */}
            <div
                className="absolute inset-0 z-0"
                style={{ transform: `translateY(${offset}px)` }}
            >
                {/* Cinematic gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0d0d0d] to-[#1a1a0a]" />

                {/* Animated floating elements for visual interest */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] animate-pulse" />
                    <div
                        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-[100px] animate-pulse"
                        style={{ animationDelay: "1s" }}
                    />
                    <div
                        className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/2 rounded-full blur-[80px] animate-pulse"
                        style={{ animationDelay: "2s" }}
                    />
                </div>

                {/* Watch Illustration */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <svg
                        viewBox="0 0 400 400"
                        className="w-[500px] h-[500px] md:w-[700px] md:h-[700px]"
                    >
                        {/* Outer ring */}
                        <circle
                            cx="200"
                            cy="200"
                            r="180"
                            fill="none"
                            stroke="#c9a96e"
                            strokeWidth="0.5"
                            opacity="0.3"
                        />
                        <circle
                            cx="200"
                            cy="200"
                            r="160"
                            fill="none"
                            stroke="#c9a96e"
                            strokeWidth="1"
                            opacity="0.4"
                        />
                        <circle
                            cx="200"
                            cy="200"
                            r="155"
                            fill="none"
                            stroke="#c9a96e"
                            strokeWidth="0.3"
                            opacity="0.3"
                        />
                        {/* Hour markers */}
                        {Array.from({ length: 12 }).map((_, i) => {
                            const angle = (i * 30 * Math.PI) / 180;
                            const x1 = 200 + 145 * Math.sin(angle);
                            const y1 = 200 - 145 * Math.cos(angle);
                            const x2 = 200 + 155 * Math.sin(angle);
                            const y2 = 200 - 155 * Math.cos(angle);
                            return (
                                <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#c9a96e"
                                    strokeWidth={i % 3 === 0 ? 2 : 1}
                                    opacity="0.6"
                                />
                            );
                        })}
                        {/* Hour hand */}
                        <line
                            x1="200"
                            y1="200"
                            x2="200"
                            y2="110"
                            stroke="#c9a96e"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.7"
                        />
                        {/* Minute hand */}
                        <line
                            x1="200"
                            y1="200"
                            x2="260"
                            y2="160"
                            stroke="#c9a96e"
                            strokeWidth="2"
                            strokeLinecap="round"
                            opacity="0.6"
                        />
                        {/* Center dot */}
                        <circle cx="200" cy="200" r="4" fill="#c9a96e" opacity="0.8" />
                        {/* Sub-dials */}
                        <circle
                            cx="200"
                            cy="140"
                            r="25"
                            fill="none"
                            stroke="#c9a96e"
                            strokeWidth="0.5"
                            opacity="0.3"
                        />
                        <circle
                            cx="155"
                            cy="210"
                            r="20"
                            fill="none"
                            stroke="#c9a96e"
                            strokeWidth="0.5"
                            opacity="0.3"
                        />
                        <circle
                            cx="245"
                            cy="210"
                            r="20"
                            fill="none"
                            stroke="#c9a96e"
                            strokeWidth="0.5"
                            opacity="0.3"
                        />
                    </svg>
                </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-10" />

            {/* Content */}
            <div className="relative z-20 text-center px-6">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-gold tracking-[0.4em] text-xs md:text-sm uppercase mb-4"
                >
                    EST. 1978
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-light tracking-wide leading-tight"
                >
                    Discover
                    <br />
                    <span className="text-gold">Saqib</span> Watches
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="mt-6 text-gray-muted text-sm md:text-base tracking-widest max-w-md mx-auto"
                >
                    The Perfect Blend of Luxury, Beauty, and Elegance
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <a
                        href="#arrivals"
                        className="px-8 py-3 border border-gold text-gold text-sm tracking-[0.2em] uppercase hover:bg-gold hover:text-black transition-all duration-500"
                    >
                        Explore Collection
                    </a>
                    <button
                        onClick={() => setVideoOpen(true)}
                        className="px-8 py-3 text-gray-muted text-sm tracking-[0.2em] uppercase hover:text-white transition-colors duration-300 flex items-center gap-2 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Watch Full Video
                    </button>
                </motion.div>
            </div>

            {/* Video Modal */}
            <VideoModal
                isOpen={videoOpen}
                onClose={() => setVideoOpen(false)}
                videoUrl={INTRO_VIDEO_URL}
            />

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
            >
                <span className="text-gray-muted text-xs tracking-[0.3em] uppercase">
                    Scroll
                </span>
                <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
            </motion.div>
        </section>
    );
}

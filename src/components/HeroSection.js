"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import VideoModal from "@/components/VideoModal";
import gsap from "gsap";
import Link from "next/link";
import { FaArrowRight, FaPlay } from "react-icons/fa";

const INTRO_VIDEO_URL = "/saqib_into.MOV";

export default function HeroSection() {
    const heroRef = useRef(null);
    const hourHandRef = useRef(null);
    const minuteHandRef = useRef(null);
    const clockCircleRef = useRef(null);
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

    // GSAP clock animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Rotate hour hand slowly
            if (hourHandRef.current) {
                gsap.to(hourHandRef.current, {
                    rotation: 360,
                    svgOrigin: "200 200",
                    duration: 120,
                    repeat: -1,
                    ease: "none",
                });
            }

            // Rotate minute hand
            if (minuteHandRef.current) {
                gsap.to(minuteHandRef.current, {
                    rotation: 360,
                    svgOrigin: "200 200",
                    duration: 30,
                    repeat: -1,
                    ease: "none",
                });
            }

            // Pulsing glow on outer clock circle
            if (clockCircleRef.current) {
                gsap.to(clockCircleRef.current, {
                    opacity: 0.3,
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            }
        });

        return () => ctx.revert();
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
                        {/* Outer ring — pulsing glow */}
                        <circle
                            ref={clockCircleRef}
                            cx="200"
                            cy="200"
                            r="180"
                            fill="none"
                            stroke="#c9a96e"
                            strokeWidth="0.5"
                            opacity="0.15"
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
                            const x1 = (200 + 145 * Math.sin(angle)).toFixed(2);
                            const y1 = (200 - 145 * Math.cos(angle)).toFixed(2);
                            const x2 = (200 + 155 * Math.sin(angle)).toFixed(2);
                            const y2 = (200 - 155 * Math.cos(angle)).toFixed(2);
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
                        {/* Hour hand — GSAP animated */}
                        <line
                            ref={hourHandRef}
                            x1="200"
                            y1="200"
                            x2="200"
                            y2="110"
                            stroke="#c9a96e"
                            strokeWidth="3"
                            strokeLinecap="round"
                            opacity="0.7"
                        />
                        {/* Minute hand — GSAP animated */}
                        <line
                            ref={minuteHandRef}
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
            <div className="relative z-20 text-center px-6 flex flex-col items-center justify-center">
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-light tracking-wide leading-tight"
                >
                    Worn by Champions.
                    <br />
                    <span className="text-gold">Saqib</span> Watches
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="mt-6 text-gray-muted text-sm md:text-base tracking-widest max-w-lg mx-10"
                    
                >
                    Curated by Pakistan&apos;s Physique Champion. Built for everyone who values precision.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link 
                        href="/gallery" 
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            padding: '1.25rem 3rem',
                            background: 'transparent',
                            border: '1px solid #C9A94C',
                            color: '#C9A94C',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4em',
                            fontSize: '0.75rem',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                            boxShadow: '0 0 20px rgba(201,169,76,0.1)'
                        }}
                        className="group hover:bg-gold hover:text-black hidden sm:inline-flex"
                    >
                        <span className="relative z-10 group-hover:text-black">Explore Collection</span>
                        <FaArrowRight className="relative z-10 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-black" />
                        <div 
                            className="absolute inset-0 bg-gold translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                            style={{ zIndex: 0 }}
                        />
                    </Link>

                    {/* Mobile optimized version of Explore Collection without fixed padding issues */}
                    {/* <Link 
                        href="/gallery" 
                        className="sm:hidden group relative inline-flex items-center gap-4 border border-gold px-8 py-4 text-gold hover:text-black overflow-hidden transition-all duration-500 shadow-[0_0_15px_rgba(201,169,76,0.1)]"
                    >
                        <span className="relative z-10 text-xs tracking-[0.3em] uppercase font-bold group-hover:text-black">Explore Collection</span>
                        <FaArrowRight className="relative z-10 text-[10px] transition-transform duration-500 group-hover:translate-x-1 group-hover:text-black" />
                        <div 
                            className="absolute inset-0 bg-gold translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                            style={{ zIndex: 0 }}
                        />
                    </Link> */}

                    <button
                        onClick={() => setVideoOpen(true)} style={{ padding: "15px" }}
                        className="group  relative inline-flex items-center gap-4 px-6 sm:px-8 py-3 sm:py-[1.15rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-gold/30 transition-all duration-500 cursor-pointer"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gold text-gold group-hover:bg-gold group-hover:text-black transition-colors duration-500 relative shrink-0">
                            <FaPlay className="text-[10px] ml-0.5" />
                            <div className="absolute inset-0 rounded-full border border-gold animate-ping opacity-30 group-hover:opacity-0 transition-opacity duration-300" />
                        </div>
                        <span className="text-white text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-semibold">
                            Full Experience
                        </span>
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

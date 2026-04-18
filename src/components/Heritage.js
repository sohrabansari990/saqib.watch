"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function Heritage() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section
            id="about"
            ref={sectionRef}
            className="relative py-32 md:py-48 px-6 md:px-12 overflow-hidden"
            style={{ padding: "2vw 0vw 4vw 0vw" }}
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark via-[#0d0a05] to-dark" />

            {/* Decorative gear/mechanism background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <svg viewBox="0 0 600 600" className="w-[800px] h-[800px]">
                    {/* Outer gear */}
                    <circle
                        cx="300"
                        cy="300"
                        r="250"
                        fill="none"
                        stroke="#c9a96e"
                        strokeWidth="1"
                    />
                    <circle
                        cx="300"
                        cy="300"
                        r="240"
                        fill="none"
                        stroke="#c9a96e"
                        strokeWidth="0.5"
                    />
                    {/* Gear teeth */}
                    {Array.from({ length: 60 }).map((_, i) => {
                        const angle = (i * 6 * Math.PI) / 180;
                        const r1 = i % 5 === 0 ? 250 : 245;
                        const r2 = 260;
                        const x1 = (300 + r1 * Math.sin(angle)).toFixed(2);
                        const y1 = (300 - r1 * Math.cos(angle)).toFixed(2);
                        const x2 = (300 + r2 * Math.sin(angle)).toFixed(2);
                        const y2 = (300 - r2 * Math.cos(angle)).toFixed(2);
                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#c9a96e"
                                strokeWidth={i % 5 === 0 ? 2 : 0.5}
                            />
                        );
                    })}
                    {/* Inner rings */}
                    <circle
                        cx="300"
                        cy="300"
                        r="180"
                        fill="none"
                        stroke="#c9a96e"
                        strokeWidth="0.5"
                    />
                    <circle
                        cx="300"
                        cy="300"
                        r="120"
                        fill="none"
                        stroke="#c9a96e"
                        strokeWidth="0.5"
                    />
                    <circle
                        cx="300"
                        cy="300"
                        r="60"
                        fill="none"
                        stroke="#c9a96e"
                        strokeWidth="1"
                    />
                    {/* Cross lines */}
                    <line
                        x1="300"
                        y1="50"
                        x2="300"
                        y2="550"
                        stroke="#c9a96e"
                        strokeWidth="0.3"
                    />
                    <line
                        x1="50"
                        y1="300"
                        x2="550"
                        y2="300"
                        stroke="#c9a96e"
                        strokeWidth="0.3"
                    />
                </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 flex justify-center flex-col items-center w-full px-6 md:px-12 2xl:px-20 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-gold tracking-[0.5em] text-xs uppercase mb-6"
                >
                    THE BRAND
                </motion.p>

                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-light mb-6"
                >
                    Precision Meets Passion
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="w-24 h-px bg-gold mx-auto mb-12"
                />

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="text-gray-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12 "
                >
                    Saqib Watches was born from a champion's obsession with quality.
                    Every timepiece in our collection is handpicked for its craftsmanship,
                    authenticity, and style — curated by someone who understands what
                    it means to pursue excellence.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <Link 
                        href="/about" 
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
                        className="group hover:bg-gold hover:text-black"
                    >
                        <span className="relative z-10 group-hover:text-black">Our Story</span>
                        <FaArrowRight className="relative z-10 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-black" />
                        <div 
                            className="absolute inset-0 bg-gold translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                            style={{ zIndex: 0 }}
                        />
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                    {[
                        { value: "500+", label: "WATCHES SOLD" },
                        { value: "20+", label: "CITIES DELIVERED" },
                        { value: "31K+", label: "INSTAGRAM FOLLOWERS" },
                        { value: "4", label: "COLLECTION CATEGORIES" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="font-serif text-3xl md:text-4xl text-gold mb-1">
                                {stat.value}
                            </p>
                            <p className="text-gray-muted text-[10px] md:text-xs tracking-[0.2em] uppercase">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

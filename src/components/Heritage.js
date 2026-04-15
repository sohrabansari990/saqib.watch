"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

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
                        const x1 = 300 + r1 * Math.sin(angle);
                        const y1 = 300 - r1 * Math.cos(angle);
                        const x2 = 300 + r2 * Math.sin(angle);
                        const y2 = 300 - r2 * Math.cos(angle);
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
            <div className="relative z-10 w-full px-6 md:px-12 2xl:px-20 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-gold tracking-[0.5em] text-xs uppercase mb-6"
                >
                    Heritage
                </motion.p>

                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-light mb-6"
                >
                    Precision
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="w-24 h-px bg-gold mx-auto mb-8"
                />

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="font-serif text-2xl md:text-3xl text-gold-light mb-4"
                >
                    46 years in watch-making
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-gray-muted text-sm tracking-[0.3em] uppercase mb-12"
                >
                    EST. 1978
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="text-gray-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12"
                >
                    With over four decades of experience in watchmaking, Saqib Watches
                    represents the perfect blend of traditional craftsmanship and modern
                    design. Every timepiece is a testament to our commitment to precision,
                    beauty, and elegance.
                </motion.p>

                <motion.a
                    href="/about"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="inline-block px-10 py-4 border border-gold text-gold text-xs tracking-[0.3em] uppercase hover:bg-gold hover:text-black transition-all duration-500"
                >
                    More About Us
                </motion.a>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                    {[
                        { value: "46+", label: "Years" },
                        { value: "10M+", label: "Customers" },
                        { value: "50+", label: "Countries" },
                        { value: "1978", label: "Est." },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="font-serif text-3xl md:text-4xl text-gold mb-1">
                                {stat.value}
                            </p>
                            <p className="text-gray-muted text-xs tracking-[0.2em] uppercase">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

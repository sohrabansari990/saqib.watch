"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const categories = [
    {
        id: "men",
        title: "Lahza Watches For Men",
        subtitle: "Make a bold statement with Lahza's timepieces for Men",
        gradient: "from-[#1a2a3a] via-[#0d1520] to-black",
        iconColor: "#4a6a8a",
        accentColor: "#c9a96e",
    },
    {
        id: "women",
        title: "Lahza Watches For Women",
        subtitle: "Unleash your feminine charm with Lahza's timepieces for Women",
        gradient: "from-[#3a1a2a] via-[#200d15] to-black",
        iconColor: "#8a4a6a",
        accentColor: "#e0c88a",
    },
    {
        id: "couples",
        title: "Lahza Watches For Couples",
        subtitle: "Celebrate togetherness with matching Lahza timepieces",
        gradient: "from-[#2a2a1a] via-[#15150d] to-black",
        iconColor: "#6a6a4a",
        accentColor: "#c9a96e",
    },
];

function CategoryCard({ category, index }) {
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="group relative overflow-hidden rounded-xl cursor-pointer"
        >
            <Link href={`/gallery?category=${category.id}`} className="block h-full">
                <div
                    className={`relative bg-gradient-to-b ${category.gradient} aspect-[3/4] md:aspect-[2/3] flex flex-col items-center justify-center p-8 transition-all duration-700 h-full`}
                >
                    {/* Background watch silhouette */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                        <svg viewBox="0 0 200 200" className="w-64 h-64">
                            <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke={category.iconColor}
                                strokeWidth="1"
                            />
                            <circle
                                cx="100"
                                cy="100"
                                r="70"
                                fill="none"
                                stroke={category.iconColor}
                                strokeWidth="0.5"
                            />
                            {Array.from({ length: 12 }).map((_, i) => {
                                const angle = (i * 30 * Math.PI) / 180;
                                const x1 = 100 + 65 * Math.sin(angle);
                                const y1 = 100 - 65 * Math.cos(angle);
                                const x2 = 100 + 70 * Math.sin(angle);
                                const y2 = 100 - 70 * Math.cos(angle);
                                return (
                                    <line
                                        key={i}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={category.iconColor}
                                        strokeWidth={i % 3 === 0 ? 2 : 0.8}
                                    />
                                );
                            })}
                            <circle cx="100" cy="100" r="3" fill={category.iconColor} />
                        </svg>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center">
                        <h3 className="font-serif text-2xl md:text-3xl text-white mb-3 group-hover:text-gold transition-colors duration-500">
                            {category.title}
                        </h3>
                        <p className="text-gray-muted text-sm md:text-base max-w-xs mx-auto mb-8 leading-relaxed">
                            {category.subtitle}
                        </p>
                        <span className="inline-block px-8 py-3 border border-gold/50 text-gold text-xs tracking-[0.3em] uppercase group-hover:bg-gold group-hover:text-black transition-all duration-500">
                            Explore
                        </span>
                    </div>

                    {/* Hover glow */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                        style={{ background: category.accentColor }}
                    />
                </div>
            </Link>
        </motion.div>
    );
}

export default function CategoryCards() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section id="products" ref={sectionRef} className="py-20 md:py-32 px-6 md:px-12 2xl:px-20 bg-dark">
            <div className="w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="text-gold tracking-[0.4em] text-xs uppercase mb-3">
                        Collections
                    </p>
                    <h2 className="font-serif text-4xl md:text-6xl text-white font-light">
                        Watches For Men, Women & Couples
                    </h2>
                    <div className="mt-6 w-16 h-px bg-gold mx-auto" />
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat, i) => (
                        <CategoryCard key={cat.id} category={cat} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

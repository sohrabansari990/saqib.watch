"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const categories = [
    {
        id: "men",
        title: "For Men",
        tagline: "Bold. Classic. Powerful.",
        badge: "24 Watches",
        gradient: "from-[#0a0a0a] via-[#0d1525] to-[#1a2a4a]",
        iconColor: "#4a6a8a",
        accentColor: "#c9a96e",
        imagePath: "/men watches.jpg",
    },
    {
        id: "women",
        title: "For Women",
        tagline: "Elegant. Refined. Timeless.",
        badge: "18 Watches",
        gradient: "from-[#0a0a0a] via-[#200d18] to-[#3a1a2a]",
        iconColor: "#8a4a6a",
        accentColor: "#e0c88a",
        imagePath: "/women watches.jpg",
    },
    {
        id: "couples",
        title: "For Couples",
        tagline: "Together. Always.",
        badge: "12 Sets",
        gradient: "from-[#0a0a0a] via-[#1a1a0d] to-[#2a2a1a]",
        iconColor: "#6a6a4a",
        accentColor: "#c9a96e",
        imagePath: "/couple watches.jpg",
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
            className="group relative overflow-hidden rounded-2xl cursor-pointer border border-white/5 hover:border-gold/60 transition-all duration-500 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10"
        >
            <Link href={`/gallery?category=${category.id}`} className="block h-full">
                <div
                    className={`relative bg-gradient-to-b ${category.gradient} flex flex-col justify-end p-8 md:p-10 transition-all duration-500 ease-in-out`}
                    style={{ minHeight: "500px" }}
                >
                    {/* Item count badge — top right */}
                    <div className="absolute top-6 right-6 z-20">
                        <span className="inline-block rounded bg-gold/10 border border-gold/30 px-3 py-1 text-gold text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold backdrop-blur-md">
                            {category.badge}
                        </span>
                    </div>

                    {/* Background watch image */}
                    <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 group-hover:scale-[1.03] transition-all duration-700 pointer-events-none">
                        <Image
                            src={category.imagePath}
                            alt={category.title}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            priority={index === 0}
                            quality={75}
                        />
                        {/* Gradient mask to blend image into the dark card edges */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-transparent to-transparent" />
                    </div>

                    {/* Content — bottom left (absolutely positioned to perfectly match badge padding) */}
                    <div className="absolute bottom-6 left-6 right-6 z-20 text-left">
                        <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-3 group-hover:text-gold transition-colors duration-500">
                            {category.title}
                        </h3>
                        <p className="text-gray-400 text-sm md:text-base tracking-wide mb-6">
                            {category.tagline}
                        </p>
                        <span className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-xs tracking-[0.25em] uppercase group-hover:border-gold group-hover:bg-gold group-hover:text-black transition-all duration-500 font-medium cursor-pointer">
                            Explore Collection <span className="text-lg leading-none">→</span>
                        </span>
                    </div>

                    {/* Hover glow */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-64 rounded-t-[100%] blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
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
                        <CategoryCard key={cat.id} category={cat}  index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

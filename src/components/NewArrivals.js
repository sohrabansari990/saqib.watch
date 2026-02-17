"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { products } from "@/data/products";

function WatchCard({ watch }) {
    return (
        <Link href={`/product/${watch.id}`} className="group cursor-pointer block h-full">
            <div className="relative overflow-hidden bg-dark-card rounded-lg aspect-[3/4] mb-4">
                {/* Watch illustration */}
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                    <svg viewBox="0 0 200 300" className="w-3/4 h-3/4">
                        {/* Strap top */}
                        <rect
                            x="70"
                            y="10"
                            width="60"
                            height="80"
                            rx="8"
                            fill={watch.color}
                            opacity="0.8"
                        />
                        <rect
                            x="75"
                            y="15"
                            width="50"
                            height="70"
                            rx="6"
                            fill="none"
                            stroke={watch.accent}
                            strokeWidth="0.5"
                            opacity="0.3"
                        />
                        {/* Watch case */}
                        <circle cx="100" cy="150" r="55" fill={watch.color} />
                        <circle
                            cx="100"
                            cy="150"
                            r="52"
                            fill="none"
                            stroke={watch.accent}
                            strokeWidth="1.5"
                        />
                        <circle
                            cx="100"
                            cy="150"
                            r="48"
                            fill="none"
                            stroke={watch.accent}
                            strokeWidth="0.5"
                            opacity="0.5"
                        />
                        {/* Crown */}
                        <rect
                            x="155"
                            y="145"
                            width="12"
                            height="10"
                            rx="2"
                            fill={watch.accent}
                            opacity="0.6"
                        />
                        {/* Dial */}
                        <circle cx="100" cy="150" r="44" fill="#0a0a0a" opacity="0.9" />
                        {/* Hour markers */}
                        {Array.from({ length: 12 }).map((_, i) => {
                            const angle = (i * 30 * Math.PI) / 180;
                            const x1 = 100 + 38 * Math.sin(angle);
                            const y1 = 150 - 38 * Math.cos(angle);
                            const x2 = 100 + 42 * Math.sin(angle);
                            const y2 = 150 - 42 * Math.cos(angle);
                            return (
                                <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke={watch.accent}
                                    strokeWidth={i % 3 === 0 ? 1.5 : 0.5}
                                    opacity="0.8"
                                />
                            );
                        })}
                        {/* Hands */}
                        <line
                            x1="100"
                            y1="150"
                            x2="100"
                            y2="118"
                            stroke={watch.accent}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <line
                            x1="100"
                            y1="150"
                            x2="125"
                            y2="138"
                            stroke={watch.accent}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <line
                            x1="100"
                            y1="150"
                            x2="95"
                            y2="120"
                            stroke="#e74c3c"
                            strokeWidth="0.5"
                            strokeLinecap="round"
                        />
                        {/* Center */}
                        <circle cx="100" cy="150" r="2.5" fill={watch.accent} />
                        {/* Brand text */}
                        <text
                            x="100"
                            y="170"
                            textAnchor="middle"
                            fill={watch.accent}
                            fontSize="5"
                            fontFamily="serif"
                            opacity="0.7"
                        >
                            SVESTON
                        </text>
                        {/* Strap bottom */}
                        <rect
                            x="70"
                            y="210"
                            width="60"
                            height="80"
                            rx="8"
                            fill={watch.color}
                            opacity="0.8"
                        />
                        <rect
                            x="75"
                            y="215"
                            width="50"
                            height="70"
                            rx="6"
                            fill="none"
                            stroke={watch.accent}
                            strokeWidth="0.5"
                            opacity="0.3"
                        />
                    </svg>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Quick view */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-xs tracking-[0.2em] text-gold uppercase">
                        View Details
                    </span>
                </div>
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg text-center text-white group-hover:text-gold transition-colors duration-300">
                {watch.name}
            </h3>
            <p className="text-center text-gold text-sm mt-1">{watch.price}</p>
        </Link>
    );
}

export default function NewArrivals() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    return (
        <section
            id="arrivals"
            ref={sectionRef}
            className="py-20 md:py-32 px-6 md:px-12 2xl:px-20 bg-dark"
        >
            <div className="w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="text-gold tracking-[0.4em] text-xs uppercase mb-3">
                        Discover
                    </p>
                    <h2 className="font-serif text-4xl md:text-6xl text-white font-light">
                        New Arrivals
                    </h2>
                    <div className="mt-6 w-16 h-px bg-gold mx-auto" />
                </motion.div>

                {/* Swiper Carousel */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                            1280: { slidesPerView: 5 },
                            1600: { slidesPerView: 6 },
                        }}
                        className="pb-14"
                    >
                        {products.map((watch) => (
                            <SwiperSlide key={watch.id}>
                                <WatchCard watch={watch} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>
            </div>
        </section>
    );
}

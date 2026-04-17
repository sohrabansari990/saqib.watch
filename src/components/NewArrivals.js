"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

function WatchCard({ watch }) {
    const hasDiscount =
        watch.originalPrice &&
        watch.price &&
        Number(watch.originalPrice) > Number(watch.price);

    return (
        <Link href={`/product/${watch.id}`} className="group cursor-pointer block h-full">
            <div className="relative overflow-hidden bg-dark-card rounded-lg aspect-[3/4] mb-4 border border-white/5">
                {/* SALE badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 z-20">
                        <span className="inline-block bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm">
                            SALE
                        </span>
                    </div>
                )}

                {watch.imageUrl ? (
                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                        <img
                            src={watch.imageUrl}
                            alt={watch.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                        <svg viewBox="0 0 200 300" className="w-3/4 h-3/4">
                            <rect x="70" y="10" width="60" height="80" rx="8" fill={watch.color || "#2a2a2a"} opacity="0.8" />
                            <rect x="75" y="15" width="50" height="70" rx="6" fill="none" stroke={watch.accent || "#c9a96e"} strokeWidth="0.5" opacity="0.3" />
                            <circle cx="100" cy="150" r="55" fill={watch.color || "#2a2a2a"} />
                            <circle cx="100" cy="150" r="52" fill="none" stroke={watch.accent || "#c9a96e"} strokeWidth="1.5" />
                            <circle cx="100" cy="150" r="44" fill="#0a0a0a" opacity="0.9" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* View Details overlay */}
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
            <div className="text-center mt-1">
                {hasDiscount && (
                    <span className="text-gray-muted text-xs line-through mr-2">
                        Rs. {Number(watch.originalPrice).toLocaleString()}
                    </span>
                )}
                <span className="text-gold text-sm">
                    {typeof watch.price === "number" ? `Rs. ${watch.price.toLocaleString()}` : watch.price}
                </span>
            </div>
        </Link>
    );
}

export default function NewArrivals() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (!db) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                let q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(12));
                try {
                    const snap = await getDocs(q);
                    if (!isMounted) return;
                    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (e) {
                    // Fallback if createdAt missing
                    const snap = await getDocs(query(collection(db, "products"), orderBy("name"), limit(12)));
                    if (!isMounted) return;
                    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                }
            } catch (err) {
                console.error("New arrivals load failed", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

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
                    style={{ padding: "1vw 2vw 1vw 2vw" }}
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
                    style={{ padding: "0vw 0vw 2vw 0vw" }}
                >
                    {loading ? (
                        <div className="text-center text-white py-10 animate-pulse">Loading arrivals...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">No products available yet.</div>
                    ) : (
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
                            style={{ padding: "0vw 0vw 4vw 0vw" }}
                        >
                            {products.map((watch) => (
                                <SwiperSlide key={watch.id}>
                                    <WatchCard watch={watch} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

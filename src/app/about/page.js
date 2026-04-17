"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa";

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-dark">
                {/* SECTION 1: HERO */}
                <section className="relative h-screen flex flex-col items-center justify-end overflow-hidden pb-40">
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/saqib 2.jpeg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-10" />
                    
                    <div className="relative z-20 text-center px-6 max-w-4xl w-full">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-gold tracking-[0.4em] text-xs uppercase mb-6 scale-90 md:scale-100"
                        >
                            THE FACE BEHIND THE WATCH
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="font-serif text-5xl md:text-8xl text-white font-light tracking-wide mb-6"
                        >
                            Saqib Khan
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-gray-300 text-base md:text-xl font-light tracking-widest uppercase text-balance"
                        >
                            National Physique Champion · Personal Trainer · Watch Curator
                        </motion.p>
                    </div>
                </section>

                {/* SECTION 2: HIS STORY */}
                <section className="py-24 md:py-32 px-6 md:px-12 2xl:px-20 border-b border-white/5">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative aspect-[3/4] md:aspect-square lg:aspect-[3/4] rounded-lg overflow-hidden border border-white/10"
                        >
                            <img 
                                src="/saqib.jpeg" 
                                alt="Saqib Photo here" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-gold tracking-[0.3em] text-xs uppercase mb-6 md:mb-8 font-semibold">His Story</p>
                            <h2 className="font-serif text-4xl md:text-6xl text-white mb-8 md:mb-10 leading-tight">
                                From Champion to Curator
                            </h2>
                            <div className="space-y-6 text-gray-400 leading-relaxed text-lg font-light">
                                <p>
                                    Born and raised in Peshawar, Saqib Khan is Pakistan's celebrated Physique Champion — a national-level bodybuilding athlete whose discipline extends far beyond the gym. His passion for premium timepieces began as a personal obsession with precision and craftsmanship — the same values that define his athletic career.
                                </p>
                                <p>
                                    What started as curating watches for himself soon became a mission: to bring genuine, quality timepieces to the people of Peshawar at honest prices, backed by a name his community already trusts.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* SECTION 3: STATS ROW */}
                <section className="py-20 bg-[#0a0a0a] border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 text-center">
                            {[
                                { num: "500+", label: "WATCHES SOLD" },
                                { num: "20+", label: "CITIES DELIVERED" },
                                { num: "5+", label: "YEARS IN BUSINESS" },
                                { num: "3", label: "NATIONAL TITLES" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="font-serif text-5xl md:text-6xl text-white mb-3">{stat.num}</span>
                                    <span className="text-gold text-[10px] md:text-xs tracking-[0.2em] font-semibold uppercase">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 4: SOCIAL PROOF */}
                <section className="py-24 md:py-32 px-6 bg-[#111]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16 md:mb-20">
                            <h2 className="text-gold tracking-[0.3em] text-xs font-semibold uppercase mb-4">FOLLOW THE CHAMPION</h2>
                            <p className="text-gray-400 text-xl font-light">Stay connected with Saqib across his social platforms</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Instagram */}
                            <a href="https://www.instagram.com/saqibkhan.champ/" target="_blank" rel="noopener noreferrer" className="group block">
                                <div className="h-full bg-[#1a1a1a] border border-white/5 rounded-xl p-8 md:p-12 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#E1306C] hover:shadow-2xl hover:shadow-[#E1306C]/10 flex flex-col justify-center">
                                    <FaInstagram className="text-5xl text-gray-500 group-hover:text-[#E1306C] mx-auto mb-6 transition-colors" />
                                    <h3 className="text-white font-medium text-xl mb-2">@saqibkhan.champ</h3>
                                    <p className="text-gold text-xs font-semibold tracking-[0.1em] uppercase">31.7K Followers</p>
                                </div>
                            </a>
                            
                            {/* TikTok */}
                            <a href="https://www.tiktok.com/@saqibkhan0489" target="_blank" rel="noopener noreferrer" className="group block">
                                <div className="h-full bg-[#1a1a1a] border border-white/5 rounded-xl p-8 md:p-12 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#fff] hover:shadow-2xl hover:shadow-[#fff]/10 flex flex-col justify-center">
                                    <FaTiktok className="text-5xl text-gray-500 group-hover:text-[#fff] mx-auto mb-6 transition-colors" />
                                    <h3 className="text-white font-medium text-xl mb-2">@saqibkhan0489</h3>
                                    <p className="text-gold text-xs font-semibold tracking-[0.1em] uppercase mb-1">313.9K Followers</p>
                                    <p className="text-gray-500 text-sm">12.3M Likes</p>
                                </div>
                            </a>
                            
                            {/* Facebook */}
                            <a href="https://www.facebook.com/saqib.khan.723464/" target="_blank" rel="noopener noreferrer" className="group block">
                                <div className="h-full bg-[#1a1a1a] border border-white/5 rounded-xl p-8 md:p-12 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#1877F2] hover:shadow-2xl hover:shadow-[#1877F2]/10 flex flex-col justify-center">
                                    <FaFacebook className="text-5xl text-gray-500 group-hover:text-[#1877F2] mx-auto mb-6 transition-colors" />
                                    <h3 className="text-white font-medium text-xl mb-2">Saqib Khan (Champ)</h3>
                                    <p className="text-gold text-xs font-semibold tracking-[0.1em] uppercase">80K Followers</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                {/* SECTION 5: CTA */}
                <section className="py-32 md:py-40 bg-dark border-t border-white/5 text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <h2 className="font-serif text-5xl md:text-7xl text-white mb-6">Shop The Collection</h2>
                        <p className="text-gray-400 text-lg md:text-xl font-light mb-12">Handpicked by a champion. Delivered to your door.</p>
                        <Link href="/gallery" className="inline-block bg-gold text-black font-semibold uppercase tracking-[0.2em] px-12 py-5 text-sm hover:bg-white transition-colors duration-300">
                            EXPLORE WATCHES
                        </Link>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </>
    );
}

"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { FaInstagram, FaTiktok, FaFacebook, FaArrowRight } from "react-icons/fa";
import { useRef } from "react";

export default function AboutPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

    return (
        <>
            <Header />
            <main ref={containerRef} className="min-h-screen bg-black overflow-hidden">
                {/* SECTION 1: HERO (Cinematic) */}
                <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                    <motion.div 
                        style={{ scale }}
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                        src="/saqib 2.jpeg"
                    >
                        <img 
                            src="/saqib 2.jpeg" 
                            alt="Saqib Khan" 
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10" />
                    
                    <div className="relative z-20 max-w-5xl w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <span className="text-gold tracking-[0.5em] text-[10px] md:text-xs uppercase mb-8 block font-medium">The Visionary Behind Saqib Watches</span>
                            <h1 className="font-serif text-6xl md:text-[9rem] text-white font-light tracking-tight leading-[0.9] mb-8">
                                Saqib <span className="italic block md:inline">Khan</span>
                            </h1>
                            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-gray-400 text-[10px] md:text-sm tracking-[0.3em] uppercase font-light">
                                <span>Physique Champion</span>
                                <span className="w-1 h-1 bg-gold rounded-full hidden md:block" />
                                <span>Personal Trainer</span>
                                <span className="w-1 h-1 bg-gold rounded-full hidden md:block" />
                                <span>Watch Curator</span>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div 
                        style={{ opacity }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4"
                    >
                        <span className="text-gray-500 text-[10px] tracking-[0.4em] uppercase">Scroll to explore</span>
                        <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent" />
                    </motion.div>
                </section>

                {/* THE MAN, THE MYTH, THE LEGEND */}
                <section className="relative py-32 md:py-48 px-6 bg-black">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                            {/* Visual Side */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                viewport={{ once: true }}
                                className="lg:col-span-5 relative"
                            >
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 relative group">
                                    <img 
                                        src="/saqib.jpeg" 
                                        alt="Saqib Khan Portrait" 
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                {/* Floating Accent */}
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold/10 blur-[80px] rounded-full" />
                            </motion.div>

                            {/* Content Side */}
                            <div className="lg:col-span-7 flex flex-col justify-center">
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-gold tracking-[0.4em] text-xs font-bold uppercase mb-8">His Journey</h2>
                                    <h3 className="font-serif text-5xl md:text-7xl text-white mb-10 leading-[1.1] font-light">
                                        Crafting a Legacy of <span className="text-gold italic">Precision</span>
                                    </h3>
                                    <div className="space-y-8 text-gray-400 text-lg md:text-xl font-light leading-relaxed">
                                        <p>
                                            In the heart of Peshawar, Saqib Khan has built more than just a brand — he's defined a standard of excellence. As a celebrated Physique Champion, his life has been a testament to the power of discipline, symmetry, and relentless focus.
                                        </p>
                                        <p>
                                            His transition from the athletic stage to the world of horology was born from a simple observation: that a truly magnificent watch represents the peak of human craftsmanship — much like the peak of athletic performance.
                                        </p>
                                        <p className="text-white font-medium">
                                            "A watch isn't just about time. It's about respect — for oneself, and for the craft."
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MARQUEE STATS (Center Aligned) */}
                <section className="py-24 border-y border-white/5 flex items-center justify-center">
                    <div className="max-w-7xl mx-auto px-6" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: '4rem',
                            width: '100%'
                        }}>
                            {[
                                { num: "500+", label: "Masterpieces Sold" },
                                { num: "20+", label: "Cities Reached" },
                                { num: "5+", label: "Year Legacy" },
                                { num: "3", label: "National Titles" }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    style={{ textAlign: 'center', minWidth: '150px' }}
                                    className="group"
                                >
                                    <div className="font-serif text-5xl md:text-7xl text-white mb-2 group-hover:text-gold transition-colors duration-500">{stat.num}</div>
                                    <div className="text-gold tracking-[0.2em] text-[10px] md:text-xs uppercase font-semibold">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SOCIAL ECOSYSTEM (Bento Grid Style) */}
                <section style={{padding : "5vw 0vw 5vw 0vw"}} className="py-32 md:py-48 px-6 bg-black relative overflow-hidden flex justify-center pt-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                    
                    <div className="max-w-7xl mx-auto">
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 className="text-gold tracking-[0.4em] text-xs font-bold uppercase mb-6">Stay Connected</h2>
                            <h3 className="font-serif text-4xl md:text-6xl text-white font-light">Join the Champion's Circle</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch" style={{ display: 'grid', justifyContent: 'center' }}>
                            {/* Instagram - Larger Card */}
                            <motion.a 
                                href="https://www.instagram.com/saqibkhan.champ/" 
                                target="_blank" 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="md:col-span-7 group relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-white/5 p-10 md:p-16 flex flex-col justify-between hover:border-[#E1306C]/30 transition-all duration-500"
                                style={{ margin: '0', padding: "2vw" }}
                            >
                                <div className="relative z-10 flex flex-col gap-10">
                                    <FaInstagram className="text-4xl text-gray-500 group-hover:text-[#E1306C] transition-colors duration-500 mb-8" />
                                    <h4 className="text-3xl md:text-5xl text-white font-light mb-4">@saqibkhan.champ</h4>
                                    <div className="flex items-center gap-3 text-gold text-xs tracking-widest uppercase font-bold">
                                        <span>31.7K Followers</span>
                                        <span className="w-1 h-1 bg-gold rounded-full" />
                                        <span>Global Reached</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                    <div className="w-12 h-12 rounded-full bg-[#E1306C] flex items-center justify-center text-white">
                                        <FaArrowRight />
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#E1306C]/5 blur-[100px] rounded-full pointer-events-none" />
                            </motion.a>

                            {/* TikTok */}
                            <motion.a 
                                href="https://www.tiktok.com/@saqibkhan0489" 
                                target="_blank"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="md:col-span-5 group relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-white/5 p-10 flex flex-col justify-between hover:border-white/20 transition-all duration-500"
                                style={{ margin: '0', padding: "2vw" }}
                            >
                                <div className="relative z-10 flex flex-col gap-10">
                                    <FaTiktok className="text-3xl text-gray-500 group-hover:text-white transition-colors duration-500 mb-8" />
                                    <h4 className="text-2xl text-white font-medium mb-2">@saqibkhan0489</h4>
                                    <p className="text-gold text-xs tracking-widest uppercase font-bold">313.9K Followers</p>
                                    <p className="text-gray-500 text-xs mt-2 italic uppercase tracking-tighter">12.3 Million Likes</p>
                                </div>
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
                            </motion.a>

                            {/* Facebook */}
                            <motion.a 
                                href="https://www.facebook.com/saqib.khan.723464/" 
                                target="_blank"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="md:col-span-12 group relative overflow-hidden rounded-3xl bg-neutral-900/40 border border-white/5 p-10 flex items-center justify-between hover:border-[#1877F2]/30 transition-all duration-500"
                                style={{ margin: '0', padding: "2vw" }}
                            >
                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] text-3xl shrink-0">
                                        <FaFacebook />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl text-white font-medium">Saqib Khan (Champ)</h4>
                                        <p className="text-gold text-xs tracking-widest uppercase font-bold mt-1">80K Followers Connected</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:text-black transition-all">
                                    <FaArrowRight />
                                </div>
                            </motion.a>
                        </div>
                    </div>
                </section>

                {/* THE ULTIMATE CTA */}
                <section className="relative py-48 md:py-64 bg-black overflow-hidden flex flex-col items-center justify-center px-6">
                    {/* Background Ambience */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-gold/5 blur-[150px] rounded-full" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-20" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10 text-center max-w-4xl"
                    >
                        <span className="text-gold tracking-[0.6em] text-[10px] md:text-xs uppercase mb-12 block font-bold">Experience the Excellence</span>
                        <h2 className="font-serif text-6xl md:text-[8rem] text-white font-light tracking-tight mb-12 leading-[0.9]">
                            Curated <span className="italic">For You</span>
                        </h2>
                        <p className="text-gray-400 text-lg md:text-2xl font-light mb-16 tracking-wide max-w-2xl mx-auto">
                            Every watch in our collection is hand-selected by Saqib Khan to ensure it meets the rigorous standards of a champion.
                        </p>
                        
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
                                boxShadow: '0 0 20px rgba(201,169,76,0.1)',
                                marginBottom: "2vw"
                            }}
                            className="group hover:bg-gold hover:text-black"
                        >
                            <span className="relative z-10 group-hover:text-black">Explore Collection</span>
                            <FaArrowRight className="relative z-10 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-black" />
                            <div 
                                className="absolute inset-0 bg-gold translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                                style={{ zIndex: 0 }}
                            />
                        </Link>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </>
    );
}

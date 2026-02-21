"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { FaHistory, FaGem, FaGlobe, FaClock } from "react-icons/fa";

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-dark pt-24">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden" >
                    <div className="absolute inset-0 bg-linear-to-b from-black/60 to-dark z-10" />
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-fixed"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop')" }}
                    />
                    <div className="relative z-20 text-center px-6">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-gold tracking-[0.4em] text-xs uppercase mb-4"
                        >
                            Our Heritage
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="font-serif text-5xl md:text-7xl text-white font-light tracking-wide"
                        >
                            Defining Time Since 1978
                        </motion.h1>
                    </div>
                </section>

                {/* Legacy Section */}
                <section className="py-20 md:py-32 px-6 md:px-12 2xl:px-20" style={{ padding: "0 2vw 0 2vw" }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="font-serif text-4xl text-white mb-8 border-l-4 border-gold pl-6">
                                The Lahza Legacy
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-6 text-lg">
                                Born from a passion for precision and a commitment to elegance, Lahza has been a hallmark of luxury watchmaking for over four decades. From our humble beginnings in Dubai to becoming a global icon, our journey is defined by the relentless pursuit of perfection.
                            </p>
                            <p className="text-gray-400 leading-relaxed text-lg">
                                Each Lahza timepiece is more than just a watch; it's a testament to the artistry of horology. We blend traditional craftsmanship with modern innovation to create pieces that transcend generations.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="relative aspect-video rounded-lg overflow-hidden border border-white/5"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=2070&auto=format&fit=crop" 
                                alt="Watch Craftsmanship" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gold/10 mix-blend-overlay" />
                        </motion.div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="py-20 bg-dark-lighter border-y border-white/5 px-6 md:px-12 2xl:px-20" style={{ padding: "2vw 2vw 2vw 2vw" }}>
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-5xl text-white" style={{ padding: "2vw 2vw 2vw 2vw" }}>Our Core Values</h2>
                        <div className="mt-4 w-20 h-px bg-gold mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <FaHistory />, title: "Heritage", desc: "Honoring 46 years of watchmaking excellence." },
                            { icon: <FaGem />, title: "Quality", desc: "Sourcing only the finest materials for every component." },
                            { icon: <FaGlobe />, title: "Reach", desc: "A global presence with showrooms across the world." },
                            { icon: <FaClock />, title: "Precision", desc: "Unwavering accuracy in every movement we craft." },
                        ].map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-dark p-8 rounded-lg border border-white/5 hover:border-gold/50 transition-colors group text-center"
                                style={{ padding: "2vw 2vw 2vw 2vw" }}
                            >
                                <div className="text-gold text-4xl mb-6 flex justify-center group-hover:scale-110 transition-transform">
                                    {value.icon}
                                </div>
                                <h3 className="text-white text-xl font-medium mb-4 tracking-wider">{value.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Vision Statement */}
                <section className="py-32 text-center px-6 md:px-12" style={{ padding: "2vw 2vw 2vw 2vw" }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl md:max-w-full mx-auto"
                    >
                        <span className="text-gold text-5xl mb-8 block font-serif">"</span>
                        <h3 className="font-serif text-2xl md:text-4xl text-white italic font-light leading-relaxed mb-8">
                            Our vision is to empower every individual with the elegance of a masterpiece, making luxury accessible without compromising on the soul of watchmaking.
                        </h3>
                        <p className="text-gold tracking-[0.3em] uppercase text-sm">— Sohrab Ansari, Visionary</p>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </>
    );
}

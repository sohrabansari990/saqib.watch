"use client";

import { useState, useEffect } from "react";
import { HiMenuAlt4, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { ShoppingBag, Heart } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { buildWhatsAppUrl } from "@/lib/order";
import { useBanner } from "@/context/BannerContext";

const ORDER_WHATSAPP_MESSAGE = "Hi! I'd like to place an order from Saqib Watches. Please send me the available options.";

export default function Header() {
    const { bannerHeight } = useBanner();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { cart, mounted } = useCart();
    const { favorites } = useFavorites();
    const favCount = favorites.length;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const cartCount = mounted ? cart.reduce((total, item) => total + item.quantity, 0) : 0;

    return (
        <>
            <header
                className={`fixed left-0 w-full z-50 transition-all duration-500 ${scrolled
                    ? "bg-black/90 backdrop-blur-md shadow-lg shadow-black/30"
                    : "bg-transparent"
                    }`} style={{ padding: "1vw 2vw 1vw 2vw", top: `${bannerHeight}px` }}
            >
                <div className="w-full flex items-center justify-between pl-6 pr-12 md:pl-12 md:pr-24 2xl:pl-20 2xl:pr-40 py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image src="/main_logo-removebg.png" alt="Saqib Watches" width={60} height={60} className="w-12 h-12 hover:scale-110 transition-all duration-300" />
                        <span className="sr-only">Saqib Watches</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {[
                            // { name: "Home", href: "/" },
                            { name: "About Us", href: "/about" },
                            { name: "Product Gallery", href: "/gallery" },
                            { name: "Contact Us", href: "/contact" },
                        ].map((link, i) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-white/80 hover:text-gold text-sm uppercase tracking-widest transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}

                        <a
                            href={buildWhatsAppUrl(ORDER_WHATSAPP_MESSAGE)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: "10px 16px" }}
                            className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-[#25D366] transition-all duration-300 hover:bg-[#25D366] hover:text-black"
                        >
                            <FaWhatsapp size={14} />
                            Order on WhatsApp
                        </a>

                        {/* Favorites Icon */}
                        <Link href="/favorites" className="relative group text-white/80 hover:text-gold transition-colors">
                            <Heart size={20} />
                            {favCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">
                                    {favCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart Icon */}
                        <Link href="/cart" className="relative group text-white/80 hover:text-gold transition-colors">
                            <ShoppingBag size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </nav>

                    {/* Mobile Menu Button - shows Cart count too */}
                    <div className="flex items-center gap-4 lg:hidden">
                        <a
                            href={buildWhatsAppUrl(ORDER_WHATSAPP_MESSAGE)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: "10px" }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-black"
                            aria-label="Order on WhatsApp"
                        >
                            <FaWhatsapp size={18} />
                        </a>

                        <Link href="/favorites" className="relative text-white hover:text-gold transition-colors">
                            <Heart size={24} />
                            {favCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">
                                    {favCount}
                                </span>
                            )}
                        </Link>

                        <Link href="/cart" className="relative text-white hover:text-gold transition-colors">
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="text-white hover:text-gold transition-colors"
                        >
                            <HiMenuAlt4 size={32} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Fullscreen Overlay Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ clipPath: "circle(0% at 100% 0%)" }}
                        animate={{ clipPath: "circle(150% at 100% 0%)" }}
                        exit={{ clipPath: "circle(0% at 100% 0%)" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 bg-dark z-50 flex flex-col items-center justify-center"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-8 right-8 text-white/50 hover:text-gold transition-colors"
                        >
                            <HiX size={40} />
                        </button>

                        <nav className="flex flex-col items-center gap-8 text-center">
                            {[
                                { name: "Home", href: "/" },
                                { name: "About Us", href: "/about" },
                                { name: "Product Gallery", href: "/gallery" },
                                { name: "Favorites", href: "/favorites" },
                                { name: "Cart", href: "/cart" },
                                { name: "Contact Us", href: "/contact" },
                            ].map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="font-serif text-4xl md:text-5xl text-white hover:text-gold transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* <div className="absolute bottom-10 text-gray-muted text-xs tracking-[0.3em] uppercase text-center px-4">
                            Est. 1978 — Luxury Horizon
                        </div> */}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

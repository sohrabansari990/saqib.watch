"use client";
import Image from "next/image";
import Link from "next/link";
import {
    FaFacebookF,
    FaInstagram,
    FaTiktok,
    FaWhatsapp,
    FaPhone,
    FaMapMarkerAlt,
    FaArrowRight,
} from "react-icons/fa";
import { buildWhatsAppUrl } from "@/lib/order";

const ORDER_WHATSAPP_MESSAGE = "Hi! I'd like to place an order from Saqib Watches. Please share the best available options with me.";

const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Product Gallery", href: "/gallery" },
    { label: "Contact Us", href: "/contact" },
];

const collectionLinks = [
    { label: "Men's Collection", href: "/category/mens" },
    { label: "Women's Collection", href: "/category/womens" },
    { label: "Couples' Collection", href: "/category/couples" },
];

const socialLinks = [
    {
        icon: FaInstagram,
        href: "https://www.instagram.com/saqibkhan.champ/?hl=en",
        label: "Instagram",
    },
    {
        icon: FaTiktok,
        href: "https://www.tiktok.com/@saqibkhan0489",
        label: "TikTok",
    },
    {
        icon: FaFacebookF,
        href: "https://www.facebook.com/saqib.khan.723464/",
        label: "Facebook",
    },
];

const showrooms = [
    "01, Khyber Bazar, Peshawar, Pakistan",
    "03, Zaryab Colony near Faqir Abad, Peshawar, Pakistan",
];

export default function Footer() {
    return (
        <footer className="relative bg-black border-t border-white/5 overflow-hidden w-full flex flex-col justify-center items-center">
            {/* Top Luxury Accent Line */}
            <div style={{marginTop: "20px"}} className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />

            <div className="w-full px-8 md:px-16 lg:px-24 py-20 lg:py-28 mx-auto" style={{ maxWidth: '1920px',marginLeft: "100px", marginTop: "20px" }}>
                <div 
                    style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        justifyContent: 'space-between', 
                        gap: '4rem', 
                        width: '100%' 
                    }}
                >
                    
                    {/* Brand Context Column */}
                    <div className="flex flex-col gap-8" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                        <div className="flex items-center gap-4">
                            <Image 
                                src="/main_logo-removebg.png" 
                                alt="Saqib Watches" 
                                width={60} 
                                height={60} 
                                className="w-12 h-12 object-contain" 
                            />
                            <span className="font-serif text-3xl tracking-[0.25em] text-white font-light">
                                Saqib Watches
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
                            The Perfect Blend of Luxury, Beauty, and Elegance. Curated by a champion, for those who understand excellence.
                        </p>
                        
                        <div className="flex items-center gap-4 pt-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-gold hover:text-white hover:bg-gold/10 transition-all duration-500 hover:-translate-y-1"
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick & Collection Links Column */}
                    <div 
                        className="flex flex-col sm:flex-row gap-16 sm:gap-24" 
                        style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center' }}
                    >
                        <div className="flex flex-col gap-8">
                            <h4 className="text-gold text-xs tracking-[0.3em] uppercase font-bold">
                                Navigation
                            </h4>
                            <ul className="flex flex-col gap-4">
                                {quickLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="group relative flex items-center text-gray-400 text-sm hover:text-white transition-colors duration-300 w-fit"
                                        >
                                            <FaArrowRight className="absolute -left-5 text-[10px] text-gold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                            <span className="transition-transform duration-300 group-hover:translate-x-1">{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-8">
                            <h4 className="text-gold text-xs tracking-[0.3em] uppercase font-bold">
                                Collections
                            </h4>
                            <ul className="flex flex-col gap-4">
                                {collectionLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="group relative flex items-center text-gray-400 text-sm hover:text-white transition-colors duration-300 w-fit"
                                        >
                                            <FaArrowRight className="absolute -left-5 text-[10px] text-gold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                            <span className="transition-transform duration-300 group-hover:translate-x-1">{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Contact & Showrooms Column */}
                    <div className="flex flex-col gap-8" style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', alignItems: 'flex-start' }}>
                        <h4 className="text-gold text-xs tracking-[0.3em] uppercase font-bold">
                            Touch Point
                        </h4>
                        
                        <div className="flex flex-col gap-6">
                            {showrooms.map((address, i) => (
                                <div key={i} className="flex gap-3 items-start max-w-70">
                                    <FaMapMarkerAlt className="text-gold mt-1 shrink-0" size={14} />
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {address}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4 pt-4">
                            <a
                                href={buildWhatsAppUrl(ORDER_WHATSAPP_MESSAGE)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ padding: "12px 20px" }}
                                className="group flex items-center gap-3 text-white border border-[#25D366]/25 px-6 py-3 rounded-full hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-300 w-fit"
                            >
                                <FaWhatsapp size={18} className="text-[#25D366]" />
                                <span className="text-sm font-medium tracking-wide">Order on WhatsApp</span>
                            </a>
                            {/* <a
                                href="https://wa.me/+923175177780"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 text-white border border-white/10 px-6 py-3 rounded-full hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-300 w-fit"
                            >
                                <FaWhatsapp size={18} className="text-[#25D366]" />
                                <span className="text-sm font-medium tracking-wide">Connect on WhatsApp</span>
                            </a> */}
                            <a
                                href="tel:+923175177780"
                                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 px-6 py-2 w-fit"
                            >
                                <FaPhone size={14} className="text-gold" />
                                <span className="text-sm font-light tracking-widest">+92 317 5177780</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 bg-[#050505]">
                <div className="w-full px-8 md:px-16 lg:px-24 py-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-400 mx-auto text-center md:text-left">
                    <p className="text-gray-500 text-[10px] md:text-xs tracking-[0.2em] font-light uppercase">
                        &copy; 2026 SAQIB WATCHES. ALL RIGHTS RESERVED.
                    </p>
                    <p className="text-gray-500 text-[10px] md:text-xs tracking-[0.2em] font-light uppercase border border-white/10 px-4 py-2 rounded-full">
                        PESHAWAR, PAKISTAN
                    </p>
                </div>
            </div>
        </footer>
    );
}

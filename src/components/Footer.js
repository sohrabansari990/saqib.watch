"use client";
import Image from "next/image";
import {
    FaFacebookF,
    FaInstagram,
    FaYoutube,
    FaTiktok,
    FaWhatsapp,
    FaPhone,
    FaMapMarkerAlt,
} from "react-icons/fa";

const footerLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Product Gallery", href: "#products" },
    { label: "New Arrivals", href: "#arrivals" },
    { label: "Men's Collection", href: "#men" },
    { label: "Women's Collection", href: "#women" },
    { label: "Couples' Collection", href: "#couples" },
    { label: "Outlets", href: "#outlets" },
    { label: "Dealers", href: "#dealers" },
    { label: "Contact Us", href: "#contact" },
];

const socialLinks = [
    {
        icon: FaFacebookF,
        href: "https://facebook.com/svestonofficial",
        label: "Facebook",
    },
    {
        icon: FaInstagram,
        href: "https://instagram.com/svestonofficial",
        label: "Instagram",
    },
    {
        icon: FaYoutube,
        href: "https://www.youtube.com/@SvestonWatchesOfficial",
        label: "YouTube",
    },
    {
        icon: FaTiktok,
        href: "https://www.tiktok.com/@svestonwatch",
        label: "TikTok",
    },
];

const showrooms = [
    "01, khyber bazar, peshawar, pakistan",
    "03, zaryab colony near faqir abad, peshawar, pakistan",
    
];

export default function Footer() {
    return (
        <footer className="bg-dark-lighter border-t border-white/5" style={{ padding: "2vw 2vw 0vw 2vw" }}>
            {/* Main Footer */}
            <div className="w-full px-6 md:px-12 2xl:px-20 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <Image src="/saqib%20watches.jpeg" alt="Saqib Watches" width={50} height={50} className="w-10 h-10 hover:scale-110 transition-all duration-300" />
                            <span className="font-serif text-2xl tracking-[0.3em] text-white font-light">
                                Saqib Watches
                            </span>
                        </div>
                        <p className="text-gray-muted text-sm leading-relaxed mb-6">
                            The Perfect Blend of Luxury, Beauty, and Elegance. Crafting
                            premium timepieces since 1978.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-muted hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300"
                                >
                                    <social.icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif text-lg text-gold mb-6 tracking-wider">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.slice(0, 5).map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-gray-muted text-sm hover:text-gold transition-colors duration-300 hover:pl-2"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-muted text-sm hover:text-gold transition-colors duration-300 hover:pl-2"
                                >
                                    Store Locator
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-muted text-sm hover:text-gold transition-colors duration-300 hover:pl-2"
                                >
                                    Privacy Policy
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Collections */}
                    <div>
                        <h4 className="font-serif text-lg text-gold mb-6 tracking-wider">
                            Collections
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.slice(3, 8).map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-gray-muted text-sm hover:text-gold transition-colors duration-300 hover:pl-2"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Showrooms & Contact */}
                    <div>
                        <h4 className="font-serif text-lg text-gold mb-6 tracking-wider">
                            Our Showrooms
                        </h4>
                        <div className="space-y-4 mb-8">
                            {showrooms.map((address, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <FaMapMarkerAlt
                                        className="text-gold mt-1 flex-shrink-0"
                                        size={12}
                                    />
                                    <p className="text-gray-muted text-sm leading-relaxed">
                                        {address}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Contact */}
                        <div className="space-y-3">
                            <a
                                href="https://wa.me/+923175177780"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-gray-muted hover:text-gold transition-colors duration-300"
                            >
                                <FaWhatsapp size={16} />
                                <span className="text-sm">WhatsApp</span>
                            </a>
                            <a
                                href="tel:+923175177780"
                                className="flex items-center gap-3 text-gray-muted hover:text-gold transition-colors duration-300"
                            >
                                <FaPhone size={14} />
                                <span className="text-sm">+92 317 5177780</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 md:px-20 py-6 flex flex-col md:flex-row md:max-w-[100%]  items-center justify-between gap-4">
                    <p className="text-gray-muted text-xs tracking-wider">
                        &copy; 2026 Saqib Watches. All rights reserved.
                    </p>
                    <p className="text-gray-muted text-xs tracking-wider">
                        Privacy Policy
                    </p>
                </div>
            </div>
        </footer>
    );
}

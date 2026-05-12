"use client";

import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { 
    ArrowLeft, 
    ChevronRight, 
    Smartphone, 
    Truck, 
    ShieldCheck, 
    CreditCard, 
    Lock,
    MapPin,
    Phone,
    User,
    CheckCircle2,
    Ticket
} from "lucide-react";
import {
    buildWhatsAppOrderMessage,
    buildWhatsAppUrl,
    formatOrderItems,
    getItemDisplayColor,
    getItemDisplayImageUrl,
    getItemVariantLabel,
} from "@/lib/order";

function RadioOption({ id, value, check, onChange, label, description, icon: Icon }) {
    const isChecked = check === value;
    return (
        <div
            onClick={() => onChange(value)}
            style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: "24px", 
                padding: "24px", 
                borderRadius: "20px", 
                cursor: "pointer", 
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                background: isChecked ? "rgba(201,169,76,0.08)" : "rgba(255,255,255,0.02)",
                border: isChecked ? "1px solid rgba(201,169,76,0.5)" : "1px solid rgba(255,255,255,0.05)",
                position: "relative",
                overflow: "hidden"
            }}
            className="group hover:bg-white/4 backdrop-blur-sm"
        >
            {isChecked && (
                <motion.div 
                    layoutId="activePayment"
                    style={{ position: "absolute", inset: 0, background: "linear-gradient(45deg, rgba(201,169,76,0.05) 0%, transparent 100%)" }}
                />
            )}
            
            <div style={{ 
                width: "56px", 
                height: "56px", 
                borderRadius: "16px", 
                background: isChecked ? "rgba(201,169,76,0.2)" : "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.5s",
                border: isChecked ? "1px solid rgba(201,169,76,0.3)" : "1px solid rgba(255,255,255,0.1)"
            }}>
                <Icon size={24} className={isChecked ? "text-gold" : "text-gray-500"} />
            </div>

            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "serif", fontSize: "1.125rem", color: isChecked ? "white" : "#9ca3af", transition: "color 0.5s" }}>{label}</span>
                    <div style={{ 
                        width: "20px", 
                        height: "20px", 
                        borderRadius: "50%", 
                        border: isChecked ? "2px solid #C9A84C" : "2px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isChecked ? "#C9A84C" : "transparent"
                    }}>
                        {isChecked && <CheckCircle2 size={12} className="text-black" />}
                    </div>
                </div>
                {description && <p style={{ fontSize: "12px", color: isChecked ? "#d1d5db" : "#6b7280", lineHeight: "1.6" }}>{description}</p>}
            </div>
        </div>
    );
}

const cities = [
    "Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Hyderabad", "Peshawar", "Quetta", "Sargodha", "Sialkot", "Bahawalpur", "Sukkur", "Kandhkot", "Sheikhupura", "Mardan", "Gujrat", "Larkana", "Kasur", "Rahim Yar Khan", "Sahiwal", "Okara", "Wah Cantonment", "Dera Ghazi Khan", "Mirpur Khas", "Chiniot", "Nawabshah", "Kamoke", "Burewala", "Jhelum", "Sadiqabad", "Khanewal", "Hafizabad", "Kohat", "Jacobabad", "Shikarpur", "Muzaffargarh", "Khanpur", "Gojra", "Bahawalnagar", "Muridke", "Pakpattan", "Abbottabad", "Tanda Adam", "Jaranwala", "Chishtian", "Muzaffarabad", "Attock", "Vehari", "Kot Abdul Malik", "Ferozwala", "Chakwal", "Gujranwala Cantonment", "Kamalia", "Umerkot", "Ahmedpur East", "Kot Addu", "Wazirabad", "Mansehra", "Layyah", "Mirpur", "Swabi", "Chaman", "Taxila", "Nowshera", "Khushab", "Shahdadkot", "Mianwali", "Kabal", "Lodhran", "Hasilpur", "Charsadda", "Bhakar", "Badin", "Arif Wala", "Ghotki", "Sambrial", "Jauharabad", "Daharki", "Narowal", "Tando Allahyar", "Kasur", "Mandi Bahauddin", "Tando Muhammad Khan", "Pattoki", "Haroonabad", "Skardu", "Murree", "Swat", "Malakand", "Mardan", "Bannu", "Pishin", "Kharan", "Nushki", "Hub", "Gwadar", "Turbat", "Khuzdar", "Dera Murad Jamali", "Chaman", "Lasbela", "Karak", "Hangu", "Risalpur", "Nowshera", "Mingora", "Topi", "Alpurai", "Batagram", "Timergara", "Khar", "Parachinar", "Sadda", "Landi Kotal", "Jamrud", "Ghalanai", "Kalaya", "Wana", "Miran Shah", "Mir Ali", "Tank", "Lakki Marwat", "Hassan Abdal", "Taxila"
];

export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart, mounted: contextMounted } = useCart();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        whatsapp: "",
        address: "",
        city: "",
        province: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [screenshot, setScreenshot] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);

    // City Dropdown State
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [citySearch, setCitySearch] = useState("");
    const [dynamicCities, setDynamicCities] = useState(cities);
    const [isSearching, setIsSearching] = useState(false);
    const cityInputRef = useRef(null);

    const filteredCities = dynamicCities.filter((c) =>
        c.toLowerCase().startsWith(citySearch.toLowerCase()) || 
        c.toLowerCase().includes(citySearch.toLowerCase())
    ).sort((a, b) => {
        // Prioritize prefix matches
        const aStarts = a.toLowerCase().startsWith(citySearch.toLowerCase());
        const bStarts = b.toLowerCase().startsWith(citySearch.toLowerCase());
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
    });

    // Dynamic "Online" fetching simulation/actual fetch
    useEffect(() => {
        async function fetchOnlineCities() {
            try {
                // Fetching from a comprehensive Pakistan cities repository on GitHub
                const response = await fetch("https://raw.githubusercontent.com/lutfullah-shafi/Pakistan-Cities-JSON/refs/heads/master/pakistan_cities.json");
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        // Extract names if objects, or use if already strings
                        const names = data.map(item => typeof item === 'string' ? item : item.name);
                        setDynamicCities([...new Set([...cities, ...names])].sort());
                    }
                }
            } catch (error) {
                console.log("Using robust local backup database");
            }
        }
        
        fetchOnlineCities();

        const handleClickOutside = (event) => {
            if (cityInputRef.current && !cityInputRef.current.contains(event.target)) {
                setShowCityDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !contextMounted) return;
        if (cart.length === 0 && !isOrdered) {
            router.push("/cart");
        }
    }, [cart.length, contextMounted, isOrdered, mounted, router]);

    // Simulate "Online Search" delay for UX
    useEffect(() => {
        if (citySearch) {
            setIsSearching(true);
            const timer = setTimeout(() => setIsSearching(false), 300);
            return () => clearTimeout(timer);
        } else {
            setIsSearching(false);
        }
    }, [citySearch]);

    if (!mounted || !contextMounted) return null;

    // Redirect if empty (but not if we just placed an order)
    if (cart.length === 0 && !isOrdered) {
        return null;
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setScreenshot(file);
        setImagePreview(URL.createObjectURL(file));
    };

    async function uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "easypaisa");
        formData.append("folder", "saqib-orders");

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/dsqrekouz/image/upload",
            { method: "POST", body: formData }
        );
        const data = await res.json();
        if (!data.secure_url) throw new Error("Cloudinary upload failed");
        return data.secure_url;
    }

    const amount = getCartTotal();
    const storedTotal = typeof window !== 'undefined' ? localStorage.getItem("total") : null;
    const initialDiscount = storedTotal ? Math.max(0, amount - parseFloat(storedTotal)) : 0;
    
    // Total calculation: subtotal - (cart discount OR checkout coupon discount)
    const activeDiscount = Math.max(initialDiscount, couponDiscount);
    const total = amount - activeDiscount;

    const handleApplyCoupon = async (e) => {
        if (e) e.preventDefault();
        if (!couponCode.trim()) return;

        try {
            const q = query(
                collection(db, "coupons"), 
                where("code", "==", couponCode.trim().toUpperCase()),
                where("isActive", "==", true)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const couponData = querySnapshot.docs[0].data();
                
                if (amount < couponData.minAmount) {
                    toast.error(`Min order for this coupon is Rs. ${couponData.minAmount.toLocaleString()}`);
                    return;
                }

                let disc = 0;
                if (couponData.type === "percentage") {
                    disc = (amount * couponData.value) / 100;
                } else {
                    disc = couponData.value;
                }

                setCouponDiscount(disc);
                toast.success(`Coupon applied: ${couponData.type === 'percentage' ? couponData.value + '% off' : 'Rs. ' + couponData.value.toLocaleString() + ' off'}`);
            } else {
                toast.error("Invalid or expired coupon code");
                setCouponDiscount(0);
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
            toast.error("Something went wrong applying the coupon");
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.name || !formData.whatsapp || !formData.address || !formData.city) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (paymentMethod === "online" && !screenshot) {
            toast.error("Please upload the payment screenshot.");
            return;
        }

        setLoading(true);

        try {
            let paymentProofUrl = "cash on delivery";
            if (screenshot) {
                paymentProofUrl = await uploadToCloudinary(screenshot);
            }

            const itemsList = formatOrderItems(cart);
            const paymentLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Easypaisa";

            await emailjs.send(
                "service_v3f938c",
                "template_order",
                {
                    customer_name: formData.name,
                    customer_whatsapp: formData.whatsapp,
                    customer_address: formData.address,
                    customer_city: formData.city,
                    customer_province: formData.province,
                    payment_method: paymentLabel,
                    order_items: itemsList,
                    order_total: `Rs. ${total.toLocaleString()}`,
                    payment_proof_url: paymentProofUrl,
                },
                "_B-DScnQtHlKbGAfi"
            );

            toast.success("Order Placed Successfully! 🎉", {
                description: "We've received your order. You will get a confirmation on WhatsApp soon.",
                duration: 5000,
            });
            setIsOrdered(true);
            setImagePreview(null);
            setScreenshot(null);
            router.push("/");
            setTimeout(() => clearCart(), 100);
        } catch (error) {
            console.error("Order submission error:", error);
            toast.error("Something went wrong. Please WhatsApp us directly at +92 334 5062546");
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppOrder = () => {
        const message = buildWhatsAppOrderMessage({
            title: "🛍️ *CHECKOUT ORDER — Saqib Watches*",
            items: cart,
            customer: formData,
            totalAmount: total,
            paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Easypaisa",
            intro: "I'd like to place this order via WhatsApp.",
            outro: "Please confirm availability.",
        });

        window.open(buildWhatsAppUrl(message), "_blank");
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-dark pb-32" style={{ padding: "120px 2vw 120px 2vw" }}>
                <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 5vw" }}>
                    {/* Breadcrumb / Progress Header */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: "64px", gap: "24px" }}>
                        <Link 
                            href="/cart" 
                            className="group flex items-center gap-2 text-gray-500 hover:text-gold transition-all duration-300 transform hover:-translate-x-1"
                        >
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/5 transition-all">
                                <ArrowLeft size={16} />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Return to Bag</span>
                        </Link>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }} className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-600">
                            <Link href="/cart" className="hover:text-gold transition-colors">01. Bag</Link>
                            <ChevronRight size={12} />
                            <span className="text-gold">02. Checkout</span>
                            <ChevronRight size={12} />
                            <span>03. Completion</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "64px", alignItems: "flex-start" }}>
                        {/* Left Column: Checkout Forms */}
                        <div style={{ flex: "1 1 60%", minWidth: "320px" }}>
                            <div style={{ marginBottom: "56px" }}>
                                <h1 style={{ fontFamily: "serif", fontSize: "3.5rem", fontWeight: "300", marginBottom: "16px" }}>Checkout</h1>
                                <p style={{ color: "#6b7280", letterSpacing: "0.1em", fontSize: "14px" }}>Please fulfill the details below to secure your masterpiece.</p>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
                                {/* Shipping Information Section */}
                                <section 
                                    style={{ 
                                        background: "rgba(255,255,255,0.02)", 
                                        backdropFilter: "blur(24px)", 
                                        border: "1px solid rgba(255,255,255,0.05)", 
                                        borderRadius: "32px", 
                                        padding: "48px",
                                        position: "relative",
                                        zIndex: showCityDropdown ? 50 : 1, // Elevate when dropdown is open
                                    }}
                                >
                                    {/* Decoration Clipping Container */}
                                    <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden", pointerEvents: "none" }}>
                                        <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "100%", background: "linear-gradient(to left, rgba(201,169,76,0.03), transparent)" }} />
                                    </div>
                                    
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(201,169,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <MapPin size={20} className="text-gold" />
                                        </div>
                                        <h2 style={{ fontFamily: "serif", fontSize: "1.5rem", fontWeight: "300" }}>Shipping Information</h2>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
                                        {/* Name */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", fontWeight: "bold", marginLeft: "4px" }}>Full Name *</label>
                                            <div style={{ position: "relative" }}>
                                                <User size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
                                                <input
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    style={{ width: "100%", height: "56px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "0 20px 0 48px", color: "white", fontSize: "14px", outline: "none", transition: "all 0.3s" }}
                                                    className="focus:border-gold/50 focus:bg-black/50"
                                                />
                                            </div>
                                        </div>

                                        {/* WhatsApp */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", fontWeight: "bold", marginLeft: "4px" }}>WhatsApp Number *</label>
                                            <div style={{ position: "relative" }}>
                                                <Phone size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
                                                <input
                                                    type="number"
                                                    placeholder="eg: +92 300 1234567"
                                                    value={formData.whatsapp}
                                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                    required
                                                    style={{ width: "100%", height: "56px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "0 20px 0 48px", color: "white", fontSize: "14px", outline: "none", transition: "all 0.3s" }}
                                                    className="focus:border-gold/50 focus:bg-black/50"
                                                />
                                            </div>
                                        </div>

                                        {/* Province Selection */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", fontWeight: "bold", marginLeft: "4px" }}>Province / State *</label>
                                            <div style={{ position: "relative" }}>
                                                <MapPin size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
                                                <select
                                                    value={formData.province}
                                                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                                    required
                                                    style={{ width: "100%", height: "56px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "0 20px 0 48px", color: "white", fontSize: "14px", outline: "none", transition: "all 0.3s", appearance: "none" }}
                                                    className="focus:border-gold/50 focus:bg-black/50"
                                                >
                                                    <option value="" disabled style={{ background: "#1a1a1a" }}>Select Region</option>
                                                    <option value="Punjab" style={{ background: "#1a1a1a" }}>Punjab</option>
                                                    <option value="Sindh" style={{ background: "#1a1a1a" }}>Sindh</option>
                                                    <option value="KPK" style={{ background: "#1a1a1a" }}>Khyber Pakhtunkhwa (KPK)</option>
                                                    <option value="Balochistan" style={{ background: "#1a1a1a" }}>Balochistan</option>
                                                    <option value="Gilgit-Baltistan" style={{ background: "#1a1a1a" }}>Gilgit-Baltistan</option>
                                                    <option value="Azad Kashmir" style={{ background: "#1a1a1a" }}>Azad Jammu & Kashmir</option>
                                                </select>
                                                <ChevronRight size={14} style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%) rotate(90deg)", color: "#4b5563", pointerEvents: "none" }} />
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", fontWeight: "bold", marginLeft: "4px" }}>Detailed Address *</label>
                                            <textarea
                                                placeholder="House #, Street, Area"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                required
                                                style={{ width: "100%", minHeight: "100px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px 20px", color: "white", fontSize: "14px", outline: "none", transition: "all 0.3s", resize: "none" }}
                                                className="focus:border-gold/50 focus:bg-black/50"
                                            />
                                        </div>

                                        {/* City Selection */}
                                        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "12px" }} ref={cityInputRef}>
                                            <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", fontWeight: "bold", marginLeft: "4px" }}>City *</label>
                                            <div style={{ position: "relative" }}>
                                                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#4b5563", pointerEvents: "none" }}>
                                                    <ChevronRight size={16} style={{ transform: "rotate(90deg)" }} />
                                                </div>
                                                <input
                                                    placeholder="Search or select a city..."
                                                    value={citySearch}
                                                    onChange={(e) => {
                                                        setCitySearch(e.target.value);
                                                        setShowCityDropdown(true);
                                                        setFormData({ ...formData, city: "" });
                                                    }}
                                                    onFocus={() => setShowCityDropdown(true)}
                                                    required={!formData.city}
                                                    style={{ width: "100%", height: "56px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "0 20px 0 48px", color: "white", fontSize: "14px", outline: "none", transition: "all 0.3s" }}
                                                    className="focus:border-gold/50 focus:bg-black/50"
                                                />
                                                <AnimatePresence>
                                                    {showCityDropdown && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            style={{ position: "absolute", zIndex: 100, width: "100%", marginTop: "8px", background: "#1a1a1a", border: "1px solid rgba(201,169,76,0.3)", borderRadius: "14px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", maxHeight: "240px", overflowY: "auto", padding: "8px" }}
                                                            className="custom-scrollbar"
                                                        >
                                                            {isSearching ? (
                                                                <div style={{ padding: "16px", textAlign: "center", color: "#C9A84C", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                                                    <div className="w-4 h-4 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                                                                    <span>Searching database...</span>
                                                                </div>
                                                            ) : filteredCities.length > 0 ? (
                                                                filteredCities.map((city) => (
                                                                    <div
                                                                        key={city}
                                                                        style={{ padding: "12px 16px", borderRadius: "8px", fontSize: "14px", color: "white", cursor: "pointer", transition: "all 0.2s" }}
                                                                        className="hover:bg-gold/10 hover:text-gold"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, city });
                                                                            setCitySearch(city);
                                                                            setShowCityDropdown(false);
                                                                        }}
                                                                    >
                                                                        {city}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div style={{ padding: "16px", textAlign: "center", color: "#6b7280", fontSize: "14px" }}>No cities found in online database.</div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Payment Method Section */}
                                <section 
                                    style={{ 
                                        background: "rgba(255,255,255,0.02)", 
                                        backdropFilter: "blur(24px)", 
                                        border: "1px solid rgba(255,255,255,0.05)", 
                                        borderRadius: "32px", 
                                        padding: "48px",
                                        position: "relative",
                                    }}
                                >
                                    {/* Decoration Clipping Container */}
                                    <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden", pointerEvents: "none" }}>
                                        <div style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "100%", background: "linear-gradient(to left, rgba(201,169,76,0.03), transparent)" }} />
                                    </div>
                                    
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(201,169,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <CreditCard size={20} className="text-gold" />
                                        </div>
                                        <h2 style={{ fontFamily: "serif", fontSize: "1.5rem", fontWeight: "300" }}>Payment Method</h2>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                        <RadioOption
                                            id="cod"
                                            value="cod"
                                            label="Cash on Delivery"
                                            description="Standard delivery experience. Fulfill payment upon arrival of your masterpiece."
                                            icon={Truck}
                                            check={paymentMethod}
                                            onChange={setPaymentMethod}
                                        />
                                        <RadioOption
                                            id="online"
                                            value="online"
                                            label="Digital Transfer (Easypaisa)"
                                            description="Direct secure transfer. Recommended for faster processing and delivery."
                                            icon={Smartphone}
                                            check={paymentMethod}
                                            onChange={setPaymentMethod}
                                        />
                                        {paymentMethod === "online" && (
                                            <div style={{ display: "flex", justifyContent: "center", marginTop: "-8px" }} className="animate-in fade-in zoom-in duration-300">
                                                <div style={{ position: "relative", width: "100%", maxWidth: "280px", height: "110px", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(201,169,76,0.2)", boxShadow: "0 10px 30px rgba(201,169,76,0.05)" }}>
                                                    <Image 
                                                        src="/easypaisa.jpg" 
                                                        alt="EasyPaisa" 
                                                        fill 
                                                        style={{ objectFit: "contain", backgroundColor: "#fff" }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {paymentMethod === "online" && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <div style={{ marginTop: "32px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(201,169,76,0.2)", borderRadius: "24px", padding: "32px" }}>
                                                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                                                        <p style={{ color: "#6b7280", letterSpacing: "0.2em", fontSize: "10px", textTransform: "uppercase", marginBottom: "8px" }}>Send Precise Amount To</p>
                                                        <h3 style={{ fontSize: "2rem", fontWeight: "bold", color: "white", letterSpacing: "0.1em" }}>0334 5062546</h3>
                                                        <p style={{ color: "#C9A84C", fontWeight: "600", fontSize: "14px" }}>Erfan Khan</p>
                                                    </div>

                                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                                        <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#9ca3af", fontWeight: "bold", marginLeft: "4px" }}>Upload Receipt Screenshot *</label>
                                                        <div style={{ position: "relative" }}>
                                                            <label 
                                                                htmlFor="screenshot" 
                                                                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "140px", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "20px", cursor: "pointer", background: "rgba(255,255,255,0.02)", transition: "all 0.3s" }}
                                                                className="hover:bg-white/5 hover:border-gold/30"
                                                            >
                                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                                                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(201,169,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                                        <Smartphone size={20} className="text-gold" />
                                                                    </div>
                                                                    <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                                                        {screenshot ? <span className="text-gold font-medium">{screenshot.name}</span> : <span>Tap to upload transfer receipt</span>}
                                                                    </p>
                                                                </div>
                                                                <input id="screenshot" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                            </label>
                                                        </div>
                                                        {imagePreview && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
                                                            >
                                                                <Image
                                                                    src={imagePreview}
                                                                    alt="Payment proof preview"
                                                                    width={200}
                                                                    height={200}
                                                                    style={{ objectFit: "cover", borderRadius: "16px", border: "1px solid rgba(201,169,110,0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>

                                {/* Footer Security Note */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "24px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "16px" }}>
                                    <ShieldCheck size={18} className="text-gold/50" />
                                    <p style={{ fontSize: "12px", color: "#4b5563", letterSpacing: "0.05em" }}>Your connection is secure and your data is encrypted.</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary (Sticky) */}
                        <div style={{ flex: "1 1 35%", minWidth: "320px", position: "sticky", top: "128px" }}>
                            <Card 
                                style={{ 
                                    background: "rgba(255,255,255,0.03)", 
                                    backdropFilter: "blur(24px)", 
                                    border: "1px solid rgba(255,255,255,0.05)", 
                                    borderRadius: "32px", 
                                    padding: "40px",
                                    overflow: "hidden"
                                }}
                            >
                                <div style={{ position: "absolute", top: "-96px", right: "-96px", width: "256px", height: "256px", background: "rgba(201,169,76,0.05)", borderRadius: "50%", filter: "blur(80px)" }} />
                                
                                <CardContent style={{ padding: 0, position: "relative", zIndex: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(201,169,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <Lock size={16} className="text-gold" />
                                        </div>
                                        <h3 style={{ fontFamily: "serif", fontSize: "1.5rem", fontWeight: "300" }}>Your Order</h3>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxHeight: "360px", overflowY: "auto", paddingRight: "16px", marginBottom: "32px" }} className="custom-scrollbar">
                                        {cart.map((item) => (
                                            <div key={item.cartKey || item.id} style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                                                <div style={{ width: "72px", aspectRatio: "3/4", background: "rgba(255,255,255,0.03)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
                                                    {getItemDisplayImageUrl(item) ? (
                                                        <img src={getItemDisplayImageUrl(item)} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        <div style={{ width: "100%", height: "100%", backgroundColor: getItemDisplayColor(item) || item.color || "#151515" }} />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: "14px", fontWeight: "500", color: "white", marginBottom: "4px" }} className="line-clamp-1">{item.name}</p>
                                                    {getItemVariantLabel(item) && (
                                                        <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280", fontWeight: "bold", marginBottom: "6px" }}>
                                                            Edition: {getItemVariantLabel(item)}
                                                        </p>
                                                    )}
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                        <p style={{ fontSize: "11px", color: "#6b7280" }}>Qty: {item.quantity}</p>
                                                        <p style={{ fontSize: "13px", color: "#C9A84C", fontWeight: "600" }}>{item.price.toLocaleString()} PKR</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ padding: "32px 0", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280" }}>Selection Total</span>
                                            <span style={{ fontSize: "14px", color: "white" }}>{amount.toLocaleString()} PKR</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280" }}>Luxury Discount</span>
                                            <span style={{ fontSize: "14px", color: "#10b981" }}>- {activeDiscount.toLocaleString()} PKR</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280" }}>Global Shipping</span>
                                            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#C9A84C", fontWeight: "bold" }}>Complimentary</span>
                                        </div>

                                        {/* Coupon Input */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "8px" }}>
                                            <div style={{ position: "relative", flex: 1 }}>
                                                <Ticket size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
                                                <input
                                                    placeholder="PROMO CODE"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", height: "48px", borderRadius: "12px", paddingLeft: "40px", paddingRight: "16px", fontSize: "10px", letterSpacing: "0.2em", fontWeight: "bold", color: "white", outline: "none", transition: "all 0.3s" }}
                                                    className="focus:border-gold"
                                                />
                                            </div>
                                            <button 
                                                onClick={handleApplyCoupon}
                                                style={{ height: "48px", padding: "0 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: "bold", letterSpacing: "0.1em", borderRadius: "12px", textTransform: "uppercase", fontSize: "10px", cursor: "pointer", transition: "all 0.3s" }}
                                                className="hover:bg-gold hover:text-black"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ padding: "32px 0", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px" }}>
                                        <span style={{ fontFamily: "serif", fontSize: "1.25rem", color: "white" }}>Total Investment</span>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{ fontSize: "2rem", fontWeight: "bold", color: "white" }}>{total.toLocaleString()}</span>
                                            <span style={{ fontSize: "10px", color: "#6b7280", marginLeft: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>PKR Currency</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleWhatsAppOrder}
                                        style={{
                                            width: "100%",
                                            height: "64px",
                                            padding: "0 28px",
                                            background: "rgba(37, 211, 102, 0.08)",
                                            color: "#25D366",
                                            borderRadius: "18px",
                                            fontSize: "13px",
                                            fontWeight: "bold",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.2em",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "12px",
                                            transition: "all 0.3s",
                                            border: "1px solid rgba(37, 211, 102, 0.25)",
                                            cursor: "pointer",
                                            marginBottom: "16px",
                                        }}
                                        className="hover:bg-[#25D366] hover:text-black"
                                    >
                                        <FaWhatsapp size={18} />
                                        Order on WhatsApp
                                    </button>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        style={{ 
                                            width: "100%", 
                                            height: "72px", 
                                            background: "linear-gradient(135deg, #C9A84C 0%, #a68b3d 100%)", 
                                            color: "black", 
                                            borderRadius: "18px", 
                                            fontSize: "14px", 
                                            fontWeight: "bold", 
                                            textTransform: "uppercase", 
                                            letterSpacing: "0.2em", 
                                            display: "flex", 
                                            alignItems: "center", 
                                            justifyContent: "center", 
                                            gap: "12px",
                                            transition: "all 0.5s",
                                            boxShadow: "0 20px 40px rgba(201,169,76,0.2)",
                                            cursor: loading ? "not-allowed" : "pointer"
                                        }}
                                        className="hover:scale-[1.02] hover:shadow-gold/40 active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <span>Confirm & Place Order</span>
                                                <ShieldCheck size={20} />
                                            </div>
                                        )}
                                    </button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

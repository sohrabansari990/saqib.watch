"use client";

import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus, Truck, ArrowLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { collection, query, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
    getItemDisplayColor,
    getItemDisplayImageUrl,
    getItemVariantLabel,
} from "@/lib/order";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, mounted: contextMounted } = useCart();
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [crossSells, setCrossSells] = useState([]);

    useEffect(() => {
        const fetchCrossSells = async () => {
            try {
                const q = query(collection(db, "products"), limit(8));
                const snap = await getDocs(q);
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                const shuffled = list.sort(() => 0.5 - Math.random()).slice(0, 4);
                setCrossSells(shuffled);
            } catch (err) {
                console.error("Error fetching cross sells:", err);
            }
        };
        fetchCrossSells();
    }, []);

    const subtotal = getCartTotal();
    const total = subtotal - discount;

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!coupon.trim()) return;

        try {
            const q = query(
                collection(db, "coupons"), 
                where("code", "==", coupon.trim().toUpperCase()),
                where("isActive", "==", true)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const couponData = querySnapshot.docs[0].data();
                
                if (subtotal < couponData.minAmount) {
                    toast.error(`Min order for this coupon is Rs. ${couponData.minAmount.toLocaleString()}`);
                    return;
                }

                let disc = 0;
                if (couponData.type === "percentage") {
                    disc = (subtotal * couponData.value) / 100;
                } else {
                    disc = couponData.value;
                }

                setDiscount(disc);
                toast.success(`Coupon applied: ${couponData.type === 'percentage' ? couponData.value + '% off' : 'Rs. ' + couponData.value.toLocaleString() + ' off'}`);
            } else {
                toast.error("Invalid or expired coupon code");
                setDiscount(0);
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
            toast.error("Something went wrong applying the coupon");
        }
    };


    return (
        <div className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-gold/30">
            <Header />
            
            <main 
                style={{ padding: "120px 5vw 80px 5vw", maxWidth: "1600px", margin: "0 auto" }}
            >
                {/* Breadcrumb / Back Link */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "48px" }}>
                    <Link 
                        href="/" 
                        className="group flex items-center gap-2 text-gray-500 hover:text-gold transition-all duration-300 transform hover:-translate-x-1"
                    >
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/5 transition-all">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Return to Boutique</span>
                    </Link>
                    
                    <div className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-600">
                        <span className="text-gold">01. Shopping Bag</span>
                        <ChevronRight size={12} />
                        <span>02. Checkout Details</span>
                        <ChevronRight size={12} />
                        <span>03. Completion</span>
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "64px", alignItems: "flex-start" }}>
                    {/* Left Side: Cart Items */}
                    <div style={{ flex: "1 1 60%" }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "32px" }}>
                            <h1 className="font-serif text-4xl md:text-5xl font-light">Your Shopping Bag</h1>
                            <span className="text-gray-500 text-xs tracking-widest uppercase">
                                {cart.length} {cart.length === 1 ? 'Masterpiece' : 'Masterpieces'}
                            </span>
                        </div>

                        {cart.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/2"
                            >
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                                    <ShoppingBag size={32} className="text-gray-600" />
                                </div>
                                <p className="text-gray-400 text-lg font-light mb-8">Your bag is currently empty</p>
                                <Link href="/gallery">
                                    <Button className="bg-gold hover:bg-gold/90 text-black font-bold px-10 py-6 rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,169,76,0.2)]">
                                        Explore the Collection
                                    </Button>
                                </Link>
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                <AnimatePresence mode="popLayout">
                                    {cart.map((item) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                            key={item.cartKey || item.id}
                                            style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "32px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "32px", borderRadius: "24px", marginBottom: "32px", position: "relative" }}
                                            className="group hover:bg-white/5 transition-all duration-500 backdrop-blur-sm"
                                        >
                                            {/* Image */}
                                            <Link 
                                                href={`/product/${item.id}`} 
                                                style={{ width: "160px", aspectRatio: "3/4", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", position: "relative", flexShrink: 0 }}
                                                className="group-hover:border-gold/30 transition-all duration-500"
                                            >
                                                {getItemDisplayImageUrl(item) ? (
                                                    <Image 
                                                        src={getItemDisplayImageUrl(item)} 
                                                        alt={item.name} 
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-[#151515] flex items-center justify-center text-gray-700" style={{ backgroundColor: getItemDisplayColor(item) || "#151515" }}>NO IMG</div>
                                                )}
                                            </Link>

                                            {/* Details */}
                                            <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "16px" }}>
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <h3 className="font-serif text-2xl font-light text-white mb-1 group-hover:text-gold transition-colors duration-300">{item.name}</h3>
                                                    {getItemVariantLabel(item) && (
                                                        <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280", fontWeight: "bold" }}>
                                                            Edition: {getItemVariantLabel(item)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: "32px", marginTop: "8px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "9999px", padding: "4px", height: "48px" }}>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartKey || item.id, item.quantity - 1)}
                                                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="w-12 text-center text-sm font-bold tracking-widest">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartKey || item.id, item.quantity + 1)}
                                                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-all"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => removeFromCart(item.cartKey || item.id)}
                                                        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-[10px] uppercase tracking-widest font-bold"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span className="hidden sm:inline">Remove Piece</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex flex-col items-end gap-1 shrink-0 px-4">
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Price</span>
                                                <span className="text-xl font-bold text-gold tracking-tight">{item.price?.toLocaleString()} PKR</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                
                                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-white/5">
                                    <Link href="/gallery" className="text-gray-500 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold underline underline-offset-8">
                                        Continue Curating
                                    </Link>

                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Order Summary */}
                    <div style={{ width: "100%", maxWidth: "450px", position: "sticky", top: "128px" }}>
                        <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "32px", padding: "40px", overflow: "hidden", position: "relative" }} className="group">
                            {/* Decorative background circle */}
                            <div style={{ position: "absolute", top: "-96px", right: "-96px", width: "256px", height: "256px", background: "rgba(201,169,76,0.05)", borderRadius: "50%", filter: "blur(80px)" }} />
                            
                            <h2 style={{ fontFamily: "serif", fontSize: "1.875rem", fontWeight: "300", marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: "10" }}>Purchase Summary</h2>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "relative", zIndex: "10" }}>
                                <div className="flex justify-between items-center group/row">
                                    <span className="text-gray-500 text-xs tracking-widest uppercase">Subtotal Selection</span>
                                    <span className="text-lg font-light text-white transition-colors group-hover/row:text-gold">{subtotal.toLocaleString()}.00 PKR</span>
                                </div>
                                
                                {discount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gold text-xs tracking-widest uppercase">Special Allocation</span>
                                        <span className="text-lg font-bold text-gold">- {discount.toLocaleString()}.00 PKR</span>
                                    </div>
                                )}
                                
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                    <Input
                                        placeholder="COUPON CODE"
                                        value={coupon}
                                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                        style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)", height: "56px", borderRadius: "12px", textAlign: "center", letterSpacing: "0.2em", fontWeight: "500", fontSize: "12px", textTransform: "uppercase" }}
                                        className="focus:ring-gold/30"
                                    />
                                    <Button 
                                        variant="outline" 
                                        onClick={handleApplyCoupon}
                                        style={{ height: "56px", padding: "0 24px", border: "1px solid rgba(201,169,76,0.3)", color: "#C9A84C", fontWeight: "bold", borderRadius: "12px", background: "transparent", cursor: "pointer" }}
                                        className="hover:bg-gold hover:text-black transition-all duration-500"
                                    >
                                        Apply
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-1 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm tracking-[0.2em] uppercase font-bold">Total Investment</span>
                                        <div className="flex flex-col items-end">
                                            <span className="text-3xl font-bold text-white tracking-tighter">{total.toLocaleString()}.00</span>
                                            <span className="text-[10px] text-gold tracking-widest uppercase font-bold">PKR Currency</span>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/checkout" className="block mt-8">
                                    <button className="w-full bg-gold hover:bg-[#d4b55c] text-black h-20 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.02] shadow-[0_20px_40px_rgba(201,169,76,0.2)] group relative overflow-hidden">
                                        <span className="relative z-10 text-xs uppercase tracking-[0.3em] font-black">Secure Checkout</span>
                                        <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                                    </button>
                                </Link>

                                <div className="mt-8 flex items-start gap-4 p-5 rounded-2xl bg-white/2 border border-white/5">
                                    <div style={{margin: "10px"}} className="mt-5">
                                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                                            <Truck size={14} className="text-gold" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-white font-bold mb-1 underline underline-offset-4 decoration-gold/50">Complimentary Delivery</p>
                                        <p className="text-[11px] text-gray-500 leading-relaxed">
                                            Your masterpieces will be delivered in <span className="text-gray-300 font-bold">2-4 business days</span> with complimentary luxury insurance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Width Masterpiece Cross-Sells */}
                {crossSells.length > 0 && (
                    <section style={{ marginTop: "160px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "96px" }}>
                        <div style={{ textAlign: "center", marginBottom: "64px" }}>
                            <p style={{ color: "#C9A84C", letterSpacing: "0.4em", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "16px", textDecoration: "underline", textUnderlineOffset: "12px", textDecorationColor: "rgba(201,169,76,0.3)" }}>Complete Your Collection</p>
                            <h2 style={{ fontFamily: "serif", fontSize: "3rem", fontWeight: "300", color: "white" }}>You Might Also Like</h2>
                        </div>
                        
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "48px", width: "100%" }}>
                            {crossSells.map((product) => (
                                <Link 
                                    key={product.id} 
                                    href={`/product/${product.id}`}
                                    style={{ width: "280px", display: "flex", flexDirection: "column", alignItems: "center" }}
                                    className="group cursor-pointer"
                                >
                                    <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: "32px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", position: "relative", marginBottom: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }} className="group-hover:border-gold/30 transition-all duration-500">
                                        {product.imageUrl ? (
                                            <Image 
                                                src={product.imageUrl} 
                                                alt={product.name} 
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-1500 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">NO IMAGE</div>
                                        )}
                                        {/* Luxury overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute bottom-6 left-0 right-0 flex justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <span style={{padding: "10px"}} className="text-[10px] uppercase tracking-[0.3em] font-bold text-white bg-gold/80 backdrop-blur px-6 py-3 rounded-full">View Piece</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="font-serif text-xl font-light text-white mb-2 group-hover:text-gold transition-colors">{product.name}</h4>
                                        <p className="text-gold text-xs font-bold tracking-widest">{product.price?.toLocaleString()} PKR</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
            
            <Footer />
        </div>
    );
}

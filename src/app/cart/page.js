"use client";

import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Minus, Plus, Truck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, mounted: contextMounted } = useCart();
    const [mounted, setMounted] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [crossSells, setCrossSells] = useState([]);

    useEffect(() => {
        setMounted(true);
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

    useEffect(() => {
        if (!mounted || !contextMounted) return;
        localStorage.setItem("total", total);
    }, [mounted, contextMounted, total]);

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (coupon.trim().toUpperCase() === "SAVE10" || coupon.trim().toUpperCase() === "RAMADAN") {
            const disc = subtotal * 0.10;
            setDiscount(disc);
            toast.success("Coupon applied: 10% off");
        } else {
            toast.error("Invalid coupon code");
            setDiscount(0);
        }
    };


    return (
        <>
            <Header />
            <main className="min-h-screen bg-dark pb-20" style={{ padding: "10vw 2vw 0vw 2.5vw" }}>
                <div className="w-full px-8 md:px-12  lg:px-32 xl:px-64">
                    <div className="mb-8">
                        <Link href="/" className="text-gray-400 hover:text-gold transition-colors text-sm uppercase tracking-widest flex items-center gap-2">
                            <span>←</span> Back to Home
                        </Link>
                    </div>
                    <h1 className="font-serif text-4xl text-white mb-12">Shopping Cart</h1>

                    {cart.length === 0 ? (
                        <div className="text-center py-20 bg-dark-card rounded-lg border border-white/5" style={{ padding: "1vw" }}>
                            <p className="text-gray-muted text-lg mb-6">Your cart is empty.</p>
                            <Link href="/gallery">
                                <Button variant="outline" style={{ padding: "1vw" }}>Continue Shopping</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-6" style={{ paddingTop: "2vw" }}>
                                {cart.map((item) => (
                                    <div
                                        key={item.cartKey || item.id}
                                        className="flex flex-col sm:flex-row items-center gap-6 bg-dark-card p-6 rounded-lg border border-white/5"
                                        style={{margin: "0vw 0vw 1vw 0vw"}}
                                    >
                                        {/* Product Image */}
                                        <Link href={`/product/${item.id}`} className="w-24 h-32 bg-dark-lighter rounded flex items-center justify-center shrink-0 border border-white/10 overflow-hidden hover:border-gold/50 transition-colors">
                                            {item.imageUrl ? (
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-500">No Image</span>
                                            )}
                                        </Link>

                                        <div className="flex-1 text-center sm:text-left w-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-serif text-xl text-white">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.cartKey || item.id)}
                                                    className="text-red-500 hover:text-red-400 p-2 transition-colors sm:hidden"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                            <p className="text-gold mb-4">{item.price} PKR</p>
                                            {item.selectedColor && <p className="text-gray-400 text-sm mb-2">Color: {item.selectedColor}</p>}

                                            <div className="flex items-center justify-between sm:justify-start gap-6">
                                                <div className="flex items-center border border-white/10 rounded overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.cartKey || item.id, item.quantity - 1)}
                                                        className="p-2 hover:bg-white/5 text-white transition-colors disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={24} />
                                                    </button>
                                                    <div className="w-8 text-center text-white text-sm bg-white/5 py-2">{item.quantity}</div>
                                                    <button
                                                        onClick={() => updateQuantity(item.cartKey || item.id, item.quantity + 1)}
                                                        className="p-2 hover:bg-white/5 text-white transition-colors"
                                                    >
                                                        <Plus size={24} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.cartKey || item.id)}
                                                    className="text-red-500 hover:text-red-400 p-2 transition-colors hidden sm:block"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1" style={{ marginBottom: "3vw" }}>
                                <div className="sticky top-32">
                                    <Card style={{ padding: "1vw", margin: "1vw 0vw", marginTop: "2vw" }}>
                                        <CardHeader>
                                            <CardTitle className="text-xl">Order Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Subtotal</span>
                                                    <span>{subtotal.toFixed(2)} PKR</span>
                                                </div>
                                                {discount > 0 && (
                                                    <div className="flex justify-between text-gold">
                                                        <span>Discount</span>
                                                        <span>- {discount.toFixed(2)} PKR</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-white/10 pt-4 flex justify-between text-white font-medium text-lg">
                                                    <span>Total</span>
                                                    <span>{total.toFixed(2)} PKR</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2" style={{ padding: "1vw 0vw" }}>
                                                <Input
                                                    placeholder="Coupon code"
                                                    value={coupon}
                                                    onChange={(e) => setCoupon(e.target.value)}
                                                    className="uppercase "
                                                    style={{ padding: "1vw" }}
                                                />
                                                <Button variant="outline" onClick={handleApplyCoupon} style={{ padding: "1vw" }}>Apply</Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Link href="/checkout" className="block mt-4">
                                        <Button size="lg" className="w-full py-6 cursor-pointer uppercase tracking-widest font-bold text-sm">
                                            Proceed to Checkout
                                        </Button>
                                    </Link>
                                </div>

                                {/* Delivery Estimate */}
                                <div className="flex items-center gap-3 bg-dark-card border border-white/5 p-4 rounded-lg mt-6">
                                    <Truck size={18} className="text-gray-400" />
                                    <p className="text-gray-400 text-sm">
                                        Estimated Delivery: <strong className="text-white">2-4 business days</strong> | FREE for all orders
                                    </p>
                                </div>

                                {/* You Might Also Like */}
                                {crossSells.length > 0 && (
                                    <div className="mt-12 mb-8">
                                        <h3 className="text-gold uppercase tracking-[0.2em] text-xs font-semibold mb-4">You Might Also Like</h3>
                                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                            {crossSells.map((product) => (
                                                <Link 
                                                    key={product.id} 
                                                    href={`/product/${product.id}`}
                                                    className="shrink-0 w-64 bg-[#111] border border-white/5 rounded-lg flex items-center p-3 hover:border-gold/30 transition-colors"
                                                >
                                                    <div className="w-20 h-20 shrink-0 bg-[#1a1a1a] rounded flex items-center justify-center overflow-hidden">
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-[10px] text-gray-600">No Image</span>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 overflow-hidden">
                                                        <h4 className="font-serif text-white text-sm truncate">{product.name}</h4>
                                                        <p className="text-gold text-xs mt-1">Rs. {product.price?.toLocaleString()}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

"use client";

import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, mounted: contextMounted } = useCart();
    const [mounted, setMounted] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !contextMounted) return null;

    const subtotal = getCartTotal();
    const total = subtotal - discount;

    const handleApplyCoupon = () => {
        if (coupon.trim().toUpperCase() === "SAVE10") {
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
            <main className="min-h-screen bg-dark pb-20" style={{ padding: "60px 20px 0px 20px" }}>
                <div className="w-full px-8 md:px-12  lg:px-32 xl:px-64">
                    <div className="mb-8">
                        <Link href="/" className="text-gray-400 hover:text-gold transition-colors text-sm uppercase tracking-widest flex items-center gap-2">
                            <span>←</span> Back to Home
                        </Link>
                    </div>
                    <h1 className="font-serif text-4xl text-white mb-12">Shopping Cart</h1>

                    {cart.length === 0 ? (
                        <div className="text-center py-20 bg-dark-card rounded-lg border border-white/5">
                            <p className="text-gray-muted text-lg mb-6">Your cart is empty.</p>
                            <Link href="/gallery">
                                <Button variant="outline">Continue Shopping</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-6">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col sm:flex-row items-center gap-6 bg-dark-card p-6 rounded-lg border border-white/5"
                                    >
                                        {/* Image Placeholder */}
                                        <div className="w-24 h-32 bg-dark-lighter rounded flex items-center justify-center shrink-0 border border-white/10">
                                            <span className="text-xs text-gray-500">Image</span>
                                        </div>

                                        <div className="flex-1 text-center sm:text-left w-full">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-serif text-xl text-white">{item.name}</h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-400 p-2 transition-colors sm:hidden"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <p className="text-gold mb-4">{item.price}</p>

                                            <div className="flex items-center justify-between sm:justify-start gap-6">
                                                <div className="flex items-center border border-white/10 rounded overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-2 hover:bg-white/5 text-white transition-colors disabled:opacity-50"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <div className="w-8 text-center text-white text-sm bg-white/5 py-2">{item.quantity}</div>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-2 hover:bg-white/5 text-white transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-500 hover:text-red-400 p-2 transition-colors hidden sm:block"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-32">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-xl">Order Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between text-gray-300">
                                                    <span>Subtotal</span>
                                                    <span>${subtotal.toFixed(2)}</span>
                                                </div>
                                                {discount > 0 && (
                                                    <div className="flex justify-between text-gold">
                                                        <span>Discount</span>
                                                        <span>-${discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-white/10 pt-4 flex justify-between text-white font-medium text-lg">
                                                    <span>Total</span>
                                                    <span>${total.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Coupon code (SAVE10)"
                                                    value={coupon}
                                                    onChange={(e) => setCoupon(e.target.value)}
                                                    className="uppercase"
                                                />
                                                <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Link href="/checkout" className="block mt-4">
                                        <Button size="lg" className="w-full py-6 uppercase tracking-widest font-bold text-sm">
                                            Proceed to Checkout
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

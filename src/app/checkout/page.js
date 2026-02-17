"use client";

import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { clsx } from "clsx";

function RadioOption({ id, value, check, onChange, label, description }) {
    const isChecked = check === value;
    return (
        <div
            onClick={() => onChange(value)}
            className={clsx(
                "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                isChecked ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
            )}
        >
            <div className={clsx(
                "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                isChecked ? "border-gold" : "border-gray-500"
            )}>
                {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
            </div>
            <div>
                <label htmlFor={id} className="text-sm font-medium text-white cursor-pointer block">{label}</label>
                {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
            </div>
        </div>
    );
}

const cities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Sialkot", "Hyderabad",
    "Gujranwala", "Abbottabad", "Bahawalpur", "Sargodha", "Other"
];

export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart, mounted: contextMounted } = useCart();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        whatsapp: "",
        address: "",
        city: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [screenshot, setScreenshot] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !contextMounted) return null;

    const total = getCartTotal();

    // Redirect if empty
    if (cart.length === 0) {
        if (mounted) router.push("/cart");
        return null;
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setScreenshot(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.whatsapp || !formData.address || !formData.city) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (paymentMethod === "online" && !screenshot) {
            toast.error("Please upload the payment screenshot.");
            return;
        }

        setLoading(true);

        // Simulate API submission
        setTimeout(() => {
            toast.success("Order Placed Successfully!", {
                description: "We've received your order. You will get a confirmation on WhatsApp soon.",
                duration: 5000,
            });
            clearCart();
            router.push("/");
        }, 2500);
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-dark pb-20" style={{ padding: "120px 20px 0px 20px" }}>
                <div className="w-full px-4 md:px-12 lg:px-32 xl:px-64">
                    <div className="mb-8">
                        <button onClick={() => router.back()} className="text-gray-400 hover:text-gold transition-colors text-sm uppercase tracking-widest flex items-center gap-2">
                            <span>←</span> Back
                        </button>
                    </div>
                    <h1 className="font-serif text-3xl md:text-5xl text-white mb-12 text-center md:text-left">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">

                        {/* Left Column: Forms */}
                        <div className="lg:col-span-2 space-y-12">
                            <form onSubmit={handleSubmit}>
                                {/* Shipping Info */}
                                <div className="space-y-6 mb-12">
                                    <h2 className="text-xl font-serif text-white border-b border-white/10 pb-2">Shipping Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                                            <Input
                                                id="whatsapp"
                                                placeholder="+92 300 1234567"
                                                value={formData.whatsapp}
                                                type="number"
                                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="address">Address *</Label>
                                            <textarea
                                                id="address"
                                                className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                                placeholder="House #, Street, Area"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="city">City *</Label>
                                            <div className="relative">
                                                <select
                                                    id="city"
                                                    className="flex h-10 w-full rounded-md border border-white/10 bg-dark-card px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold appearance-none cursor-pointer"
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    required
                                                >
                                                    <option value="" disabled>Select City</option>
                                                    {cities.map((city) => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-6">
                                    <h2 className="text-xl font-serif text-white border-b border-white/10 pb-2">Payment Method</h2>
                                    <div className="space-y-4">
                                        <RadioOption
                                            id="cod"
                                            value="cod"
                                            label="Cash on Delivery"
                                            description="Pay with cash upon delivery."
                                            check={paymentMethod}
                                            onChange={setPaymentMethod}
                                        />
                                        <RadioOption
                                            id="online"
                                            value="online"
                                            label="EasyPaisa / JazzCash"
                                            description="Direct Bank Transfer / Mobile Wallet"
                                            check={paymentMethod}
                                            onChange={setPaymentMethod}
                                        />
                                    </div>

                                    {paymentMethod === "online" && (
                                        <div className="bg-dark-card border border-gold/30 rounded-lg p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                                            <div className="text-center space-y-2">
                                                <p className="text-sm text-gray-400 uppercase tracking-widest">Send Payment To</p>
                                                <p className="text-2xl text-white font-bold tracking-widest">0317 5177780</p>
                                                <p className="text-gold font-medium">Sohrab Alefi</p>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="screenshot">Upload Payment Screenshot *</Label>
                                                <div className="flex items-center justify-center w-full">
                                                    <label htmlFor="screenshot" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/10 border-dashed rounded-lg cursor-pointer bg-dark hover:bg-white/5 transition-colors">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-gold">Click to upload</span></p>
                                                            <p className="text-xs text-gray-500">{screenshot ? screenshot.name : "SVG, PNG, JPG"}</p>
                                                        </div>
                                                        <input id="screenshot" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full mt-10 py-6 text-sm uppercase tracking-widest font-bold bg-gold text-black hover:bg-gold-light transition-all shadow-lg hover:shadow-gold/20"
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : `Place Order — $${total.toFixed(2)}`}
                                </Button>
                            </form>
                        </div>

                        {/* Right Column: Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-32 border-white/10 bg-dark-lighter">
                                <CardContent className="p-8 space-y-6">
                                    <h3 className="font-serif text-xl text-white mb-4">Your Order</h3>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                                <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center shrink-0">
                                                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-sm font-medium line-clamp-2">{item.name}</p>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                        <p className="text-gold text-sm">{item.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-white/10 pt-4 space-y-2">
                                        <div className="flex justify-between text-gray-400 text-sm">
                                            <span>Subtotal</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400 text-sm">
                                            <span>Shipping</span>
                                            <span className="text-gold">Free</span>
                                        </div>
                                        <div className="border-t border-white/10 pt-4 flex justify-between text-white font-bold text-lg">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>
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

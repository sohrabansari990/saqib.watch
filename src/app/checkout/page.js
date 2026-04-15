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
import emailjs from "@emailjs/browser";
import Image from "next/image";

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
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !contextMounted) return null;

    
    // Redirect if empty (but not if we just placed an order)
    if (cart.length === 0 && !isOrdered) {
        if (mounted) router.push("/cart");
        return null;
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setScreenshot(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // Upload image to Cloudinary and return the public URL
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

    const handleSubmit = async (e) => {
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

        try {
            // 1. Upload payment screenshot to Cloudinary (if provided)
            let paymentProofUrl = "cash on delivery";
            if (screenshot) {
                paymentProofUrl = await uploadToCloudinary(screenshot);
            }

            // 2. Build items list string
            const itemsList = cart
                .map((item) => {
                    const color = item.selectedColor ? ` (${item.selectedColor})` : "";
                    return `${item.name}${color} x${item.quantity} — Rs.${item.price * item.quantity}`;
                })
                .join(" | ");

            // 3. Send order email via EmailJS
            await emailjs.send(
                "service_v3f938c",
                "template_order",
                {
                    customer_name: formData.name,
                    customer_whatsapp: formData.whatsapp,
                    customer_address: formData.address,
                    customer_city: formData.city,
                    payment_method: paymentMethod === "cod" ? "Cash on Delivery" : "EasyPaisa / JazzCash",
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
    const amount = getCartTotal();
    const storedTotal = typeof window !== 'undefined' ? localStorage.getItem("total") : null;
    const finalTotal = storedTotal ? parseFloat(storedTotal) : amount;
    const discount = Math.max(0, amount - finalTotal);
    const total = amount - discount;


    return (
        <>
            <Header />
            <main className="min-h-screen bg-dark pb-20" style={{ padding: "120px 2vw 0px 2vw" }}>
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
                                    <h2 className="text-xl font-serif text-white border-b border-white/10 pb-2" style={{ padding: "1vw 0" }}>Shipping Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2" style={{ padding: "1vw 0" }}>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="Enter your full name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                style={{ padding: "1vw" }}
                                            />
                                        </div>
                                        <div className="space-y-2" style={{ padding: "1vw 0" }}>
                                            <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                                            <Input
                                                id="whatsapp"
                                                placeholder="eg: +92 300 1234567"
                                                value={formData.whatsapp}
                                                type="number"
                                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                                required    
                                                style={{ padding: "1vw" }}
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
                                                style={{ padding: "1vw" }}
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
                                                    style={{ padding: "0vw 1vw 0vw 1vw" }}

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
                                <div className="space-y-6" style={{ padding: "1vw 0vw 1vw 0vw" }}>
                                    <h2 className="text-xl font-serif text-white border-b border-white/10 pb-2">Payment Method</h2>
                                    <div className="space-y-4" >
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
                                        <div className="bg-dark-card border border-gold/30 rounded-lg p-6 space-y-6 animate-in fade-in slide-in-from-top-4" style={{ padding: "1vw" }}>
                                            <div className="text-center space-y-2">
                                                <p className="text-sm text-gray-400 uppercase tracking-widest">Send Payment To</p>
                                                <p className="text-2xl text-white font-bold tracking-widest">0334 5062546</p>
                                                <p className="text-gold font-medium">Erfan Khan</p>
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
                                                {imagePreview && (
                                                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
                                                        <Image
                                                            src={imagePreview}
                                                            alt="Payment proof preview"
                                                            style={{
                                                                width: "160px",
                                                                height: "160px",
                                                                objectFit: "cover",
                                                                borderRadius: "8px",
                                                                border: "1px solid rgba(201,169,110,0.3)",
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full mt-10 py-6 text-sm uppercase cursor-pointer tracking-widest font-bold bg-gold text-black hover:bg-gold-light transition-all shadow-lg hover:shadow-gold/20"
                                    disabled={loading}
                                    style={{ marginBottom: "1vw" }}
                                >
                                    {loading ? "Processing..." : `Place Order — PKR ${total.toFixed(2)}`}
                                </Button>
                            </form>
                        </div>

                        {/* Right Column: Summary */}
                        <div className="lg:col-span-1" style={{ marginBottom: "2vw" }}>
                            <Card className="sticky top-32 border-white/10 bg-dark-lighter" style={{ padding: "1vw" }}>
                                <CardContent className="p-8 space-y-6">
                                    <h3 style={{ padding: "1vw 0" }} className="font-serif text-xl text-white mb-4">Your Order</h3>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.map((item) => (
                                            <div style={{ padding: "1vw 0" }} key={item.cartKey || item.id} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                                <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-sm font-medium line-clamp-2">{item.name}</p>
                                                    {item.selectedColor && <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>}
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                        <p className="text-gold text-sm">{item.price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ padding: "1vw 0" }} className="border-t border-white/10 pt-4 space-y-2">
                                        <div className="flex justify-between text-gray-400 text-sm">
                                            <span>Discount</span>
                                            <span>PKR {discount}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400 text-sm">
                                            <span>Subtotal</span>
                                            <span>PKR {total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400 text-sm">
                                            <span>Shipping</span>
                                            <span className="text-gold">Free</span>
                                        </div>
                                        <div style={{ padding: "1vw 0" }} className="border-t border-white/10 pt-4 flex justify-between text-white font-bold text-lg">
                                            <span>Total</span>
                                            <span>PKR {total.toFixed(2)}</span>
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

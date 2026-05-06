"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from "@/lib/order";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";

export default function ProductActions({ product, selectedColor }) {
    const { addToCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);
    const router = useRouter();

    const isSoldOut = product.soldOut === true;

    const handleAddToCart = () => {
        if (isSoldOut) return;
        setLoading(true);
        setTimeout(() => {
            addToCart(product, 1, selectedColor || null);
            setLoading(false);
        }, 500);
    };

    const handleBuyNow = () => {
        if (isSoldOut) return;
        setBuyNowLoading(true);
        // Clear cart so it only checks out this single item immediately.
        clearCart();
        setTimeout(() => {
            addToCart(product, 1, selectedColor || null);
            router.push("/checkout");
        }, 300);
    };

    const handleWhatsAppOrder = () => {
        const message = buildProductWhatsAppMessage(product, selectedColor);
        window.open(buildWhatsAppUrl(message), "_blank");
    };

    return (
        <div className="flex flex-col gap-4 mt-8">
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 px-6 py-6 text-xs tracking-[0.2em] uppercase font-bold border-white/20 hover:border-white hover:bg-white/5 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddToCart}
                    disabled={loading || buyNowLoading || isSoldOut}
                    style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
                >
                    <ShoppingBag size={16} className="mr-2" />
                    {isSoldOut ? "Sold Out" : loading ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                    size="lg"
                    className="flex-1 px-6 py-6 text-xs tracking-[0.2em] uppercase font-bold bg-gold hover:bg-white text-black transition-all shadow-[0_0_15px_rgba(201,169,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleBuyNow}
                    disabled={loading || buyNowLoading || isSoldOut}
                    style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
                >
                    <Zap size={16} className="mr-2" />
                    {isSoldOut ? "Unavailable" : buyNowLoading ? "Redirecting..." : "Buy It Now"}
                </Button>
            </div>
            <Button
                size="lg"
                className="w-full px-8 py-6 text-xs tracking-[0.2em] uppercase font-bold bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366] text-[#25D366] hover:text-black transition-all cursor-pointer"
                onClick={handleWhatsAppOrder}
            >
                <FaWhatsapp size={18} className="mr-2" />
                Order on WhatsApp
            </Button>
        </div>
    );
}

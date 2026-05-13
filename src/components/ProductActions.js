"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShoppingBag, Zap } from "lucide-react";

export default function ProductActions({ product, selectedColor, selectedVariantAvailable = true }) {
    const { addToCart, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);
    const router = useRouter();

    const isProductSoldOut = product.soldOut === true;
    const isSoldOut = isProductSoldOut || selectedVariantAvailable === false;

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
                    {isProductSoldOut ? "Sold Out" : selectedVariantAvailable === false ? "Color Unavailable" : loading ? "Adding..." : "Add to Cart"}
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
            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <ShieldCheck size={13} className="text-gold" />
                Confirm color and delivery at checkout.
            </div>
        </div>
    );
}

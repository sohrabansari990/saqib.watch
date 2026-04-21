"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from "@/lib/order";

export default function ProductActions({ product, selectedColor }) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handleAddToCart = () => {
        setLoading(true);
        setTimeout(() => {
            addToCart(product, 1, selectedColor || null);
            setLoading(false);
        }, 500);
    };

    const handleWhatsAppOrder = () => {
        const message = buildProductWhatsAppMessage(product, selectedColor);
        window.open(buildWhatsAppUrl(message), "_blank");
    };

    return (
        <div className="flex flex-col gap-4 mt-8">
            <Button
                size="lg"
                className="w-full md:w-auto px-10 py-6 text-sm tracking-[0.2em] uppercase font-semibold"
                onClick={handleAddToCart}
                disabled={loading}
            >
                {loading ? "Adding..." : "Add to Cart"}
            </Button>
            <Button
                size="lg"
                style={{ padding: "1rem 2rem" }}
                className="w-full md:w-auto px-10 py-6 text-sm tracking-[0.2em] uppercase font-semibold bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                onClick={handleWhatsAppOrder}
            >
                <FaWhatsapp size={20} className="mr-2" />
                Order on WhatsApp
            </Button>
        </div>
    );
}

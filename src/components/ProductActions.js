"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "923345062546";

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
        const colorText = selectedColor ? `\nColor: ${selectedColor}` : "";
        const message = `Hi! I'd like to order:\n\n*${product.name}*\nPrice: Rs. ${product.price?.toLocaleString()}${colorText}\nModel: ${product.model || product.id}\n\nPlease confirm availability.`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
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
                className="w-full md:w-auto px-10 py-6 text-sm tracking-[0.2em] uppercase font-semibold bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                onClick={handleWhatsAppOrder}
            >
                <FaWhatsapp size={20} className="mr-2" />
                Order on WhatsApp
            </Button>
            
            <Button
                size="lg"
                className="w-full md:w-auto px-10 py-6 text-sm tracking-[0.2em] uppercase font-semibold bg-[#25D366] hover:bg-[#128C7E] text-white cursor-pointer"
                onClick={() => window.open(`https://wa.me/?text=Check out this watch: ${window.location.href}`, "_blank")}
            >
                <FaWhatsapp size={20} className="mr-2" />
                Share on WhatsApp
            </Button>
        </div>
    );
}

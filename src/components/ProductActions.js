"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProductActions({ product }) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handleAddToCart = () => {
        setLoading(true);
        // Simulate a small delay for better UX
        setTimeout(() => {
            addToCart(product);
            setLoading(false);
        }, 500);
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
            <p className="text-xs text-center md:text-left text-gray-500 mt-2">
                Free shipping on all orders over $200
            </p>
        </div>
    );
}

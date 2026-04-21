"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const CartContext = createContext();

function readStoredCart() {
    if (typeof window === "undefined") {
        return [];
    }

    const savedCart = localStorage.getItem("sveston_cart");
    if (!savedCart) {
        return [];
    }

    try {
        return JSON.parse(savedCart);
    } catch (e) {
        console.error("Failed to parse cart", e);
        return [];
    }
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(readStoredCart);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("sveston_cart", JSON.stringify(cart));
        }
    }, [cart, mounted]);

    const addToCart = (product, quantity = 1, color = null) => {
        setCart((prev) => {
            const cartKey = color ? `${product.id}_${color}` : product.id;
            const existing = prev.find((item) => item.cartKey === cartKey);
            if (existing) {
                toast.success("Updated cart quantity");
                return prev.map((item) =>
                    item.cartKey === cartKey
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            toast.success("Added to cart");
            return [...prev, { ...product, cartKey, selectedColor: color, quantity }];
        });
    };

    const removeFromCart = (cartKey) => {
        setCart((prev) => prev.filter((item) => (item.cartKey || item.id) !== cartKey));
        toast.error("Removed from cart");
    };

    const updateQuantity = (cartKey, quantity) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) => ((item.cartKey || item.id) === cartKey ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            let price = item.price;
            if (typeof price === 'string') {
                price = parseFloat(price.replace(/[^0-9.-]+/g, ""));
            }
            return total + price * item.quantity;
        }, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                mounted,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

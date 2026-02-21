"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([]);
    const [mounted, setMounted] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("lahza_favorites");
        if (saved) {
            try {
                setFavorites(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
        setMounted(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("lahza_favorites", JSON.stringify(favorites));
        }
    }, [favorites, mounted]);

    const addFavorite = (product) => {
        setFavorites((prev) => {
            if (prev.find((item) => item.id === product.id)) return prev;
            toast.success("Added to favorites");
            return [...prev, { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, category: product.category }];
        });
    };

    const removeFavorite = (productId) => {
        setFavorites((prev) => prev.filter((item) => item.id !== productId));
        toast("Removed from favorites");
    };

    const toggleFavorite = (product) => {
        if (isFavorite(product.id)) {
            removeFavorite(product.id);
        } else {
            addFavorite(product);
        }
    };

    const isFavorite = (productId) => {
        return favorites.some((item) => item.id === productId);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, removeFavorite, mounted }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}

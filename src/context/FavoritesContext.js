"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const FavoritesContext = createContext();

function readStoredFavorites() {
    if (typeof window === "undefined") {
        return [];
    }

    const NEW_KEY = "saqib_favorites";
    const OLD_KEY = "lahza_favorites";

    try {
        const savedNew = localStorage.getItem(NEW_KEY);
        if (savedNew) {
            return JSON.parse(savedNew);
        }

        const savedOld = localStorage.getItem(OLD_KEY);
        return savedOld ? JSON.parse(savedOld) : [];
    } catch (e) {
        console.error("Failed to load favorites from localStorage", e);
        return [];
    }
}

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(readStoredFavorites);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const NEW_KEY = "saqib_favorites";
        const OLD_KEY = "lahza_favorites";

        try {
            if (!localStorage.getItem(NEW_KEY) && localStorage.getItem(OLD_KEY)) {
                localStorage.setItem(NEW_KEY, JSON.stringify(favorites));
            }
            localStorage.removeItem(OLD_KEY);
        } catch (e) {
            console.error("Failed to migrate favorites storage", e);
        }
    }, [favorites]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Save to localStorage (new key)
    useEffect(() => {
        if (mounted) {
            try {
                localStorage.setItem("saqib_favorites", JSON.stringify(favorites));
            } catch (e) {
                console.error("Failed to save favorites", e);
            }
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

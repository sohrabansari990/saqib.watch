"use client";

import { useFavorites } from "@/context/FavoritesContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProductHref } from "@/lib/productSlug";

export default function FavoritesPage() {
    const { favorites, removeFavorite } = useFavorites();

    return (
        <>
            <Header />
            <main className="pt-24 h-screen bg-dark flex items-center " style={{ margin: "0vw 2vw 2vw 2vw" }}>
                <div className="w-full px-4 sm:px-6 md:px-12 2xl:px-20 py-8 md:py-16">
                    {/* Page Header */}
                    <div className="mb-10">
                        <Link
                            href="/gallery"
                            className="text-gold text-xs tracking-[0.2em] uppercase mb-4 inline-flex items-center gap-2 hover:underline"
                        >
                            <ArrowLeft size={14} />
                            Back to Gallery
                        </Link>
                        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-light mt-3">
                            My Favorites
                        </h1>
                        <p className="text-gray-muted mt-2 text-sm tracking-wider">
                            {favorites.length === 0
                                ? "You haven't added any favorites yet."
                                : `${favorites.length} item${favorites.length > 1 ? "s" : ""} saved`}
                        </p>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <Heart size={64} className="text-white/10 mb-6" />
                            <p className="text-white/50 text-lg mb-6">No favorites yet</p>
                            <Link
                                href="/gallery"
                                className="px-8 py-3 bg-gold text-black text-sm uppercase tracking-wider hover:bg-gold/90 transition-colors"
                            >
                                Explore Collection
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            <AnimatePresence>
                                {favorites.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
                                        className="group relative"
                                    >
                                        <Link href={getProductHref(item)}>
                                            <div className="relative aspect-[3/4] bg-dark-card rounded-lg overflow-hidden border border-white/5">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                        </Link>

                                        {/* Unfavorite button */}
                                        <button
                                            onClick={() => removeFavorite(item.id)}
                                            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                                            title="Remove from favorites"
                                        >
                                            <Heart size={18} fill="currentColor" />
                                        </button>

                                        <Link href={getProductHref(item)}>
                                            <div className="mt-3 px-1">
                                                <h3 className="text-white text-sm font-medium truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-gold text-sm mt-1">
                                                    Rs. {item.price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

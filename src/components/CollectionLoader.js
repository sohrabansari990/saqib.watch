"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const loaderCopy = {
    gallery: {
        title: "Loading Collection",
        subtitle: "Fetching watches and images from the atelier.",
        cards: 8,
    },
    product: {
        title: "Loading Masterpiece",
        subtitle: "Preparing product details, variants, and imagery.",
        cards: 4,
    },
    similar: {
        title: "Loading Recommendations",
        subtitle: "Gathering more pieces you might like.",
        cards: 4,
    },
};

function ShimmerBlock({ className }) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/5 bg-white/3",
                className
            )}
        >
            <motion.div
                aria-hidden="true"
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/10 to-transparent"
            />
        </div>
    );
}

function LoaderHeader({ title, subtitle }) {
    return (
        <div className="flex flex-col items-center text-center gap-4">
            <div className="grid w-full max-w-xl gap-3">
                <ShimmerBlock className="mx-auto h-3 w-28 rounded-full bg-gold/10" />
                <ShimmerBlock className="mx-auto h-10 w-4/5 rounded-full md:h-14" />
                <ShimmerBlock className="mx-auto h-3 w-2/3 rounded-full" />
            </div>
            <div className="space-y-2">
                <h2 className="font-serif text-3xl md:text-5xl font-light text-white">{title}</h2>
                <p className="text-sm md:text-base text-gray-500 tracking-[0.12em] uppercase">{subtitle}</p>
            </div>
        </div>
    );
}

function GallerySkeleton({ cards }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: "1.5rem" }}>
            {Array.from({ length: cards }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="rounded-3xl border border-white/5 bg-[#101010]/80 shadow-[0_25px_50px_rgba(0,0,0,0.25)]"
                    style={{ padding: "0.9rem" }}
                >
                    <ShimmerBlock className="aspect-3/4 rounded-[18px]" />
                    <div style={{ marginTop: "1rem", paddingLeft: "0.25rem", paddingBottom: "0.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <ShimmerBlock className="h-4 w-4/5 rounded-full" />
                        <ShimmerBlock className="h-3 w-1/2 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function ProductSkeleton() {
    return (
        <div className="grid items-start lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.85fr)]" style={{ gap: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <ShimmerBlock className="aspect-4/5 rounded-[28px]" />
                <div className="grid grid-cols-4" style={{ gap: "0.75rem" }}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <ShimmerBlock key={index} className="aspect-square rounded-xl" />
                    ))}
                </div>
            </div>

            <div className="rounded-[28px] border border-white/5 bg-[#101010]/80" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <ShimmerBlock className="h-3 w-24 rounded-full" />
                <ShimmerBlock className="h-12 w-4/5 rounded-full" />
                <ShimmerBlock className="h-6 w-32 rounded-full bg-gold/15" />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "0.5rem" }}>
                    <ShimmerBlock className="h-3 w-full rounded-full" />
                    <ShimmerBlock className="h-3 w-11/12 rounded-full" />
                    <ShimmerBlock className="h-3 w-10/12 rounded-full" />
                    <ShimmerBlock className="h-3 w-9/12 rounded-full" />
                </div>
                <div style={{ display: "grid", gap: "0.75rem", paddingTop: "0.5rem" }}>
                    <ShimmerBlock className="h-12 rounded-2xl" />
                    <ShimmerBlock className="h-12 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

function SimilarSkeleton({ cards }) {
    return (
        <div className="flex flex-wrap justify-center" style={{ gap: "1.5rem" }}>
            {Array.from({ length: cards }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="w-65 md:w-70 rounded-3xl border border-white/5 bg-[#101010]/80"
                    style={{ padding: "0.9rem" }}
                >
                    <ShimmerBlock className="aspect-3/4 rounded-[20px]" />
                    <div style={{ marginTop: "1rem", paddingLeft: "0.25rem", paddingBottom: "0.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <ShimmerBlock className="h-4 w-3/4 rounded-full mx-auto" />
                            <ShimmerBlock className="h-3 w-1/2 rounded-full mx-auto" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export default function CollectionLoader({ variant = "gallery" }) {
    const copy = loaderCopy[variant] || loaderCopy.gallery;
    const isGallery = variant === "gallery";
    const outerWidthClass = isGallery ? "w-full max-w-none" : "w-full max-w-7xl";
    const sectionStyle = isGallery
        ? { padding: "5.5rem 2rem 5rem" }
        : { padding: "6rem 2.5rem 5.75rem" };
    const contentStyle = isGallery
        ? { gap: "3rem" }
        : { gap: "3.5rem" };

    return (
        <section
            className={`relative mx-auto ${outerWidthClass} overflow-hidden rounded-4xl border border-white/5 bg-[#070707]`}
            style={sectionStyle}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,169,76,0.08),transparent_45%)]" />
            <div className="absolute inset-0 opacity-50 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.02)_35%,transparent_70%)]" />
            <div className={`relative z-10 mx-auto flex w-full flex-col ${isGallery ? "max-w-none" : "max-w-7xl"}`} style={contentStyle}>
                <LoaderHeader title={copy.title} subtitle={copy.subtitle} />
                {variant === "product" ? (
                    <ProductSkeleton />
                ) : variant === "similar" ? (
                    <SimilarSkeleton cards={copy.cards} />
                ) : (
                    <GallerySkeleton cards={copy.cards} />
                )}
            </div>
        </section>
    );
}

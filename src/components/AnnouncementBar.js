"use client";

import Link from "next/link";
import { useState } from "react";

export default function AnnouncementBar({ onVisibilityChange }) {
    const [visible, setVisible] = useState(true);

    const handleClose = () => {
        setVisible(false);
        if (onVisibilityChange) onVisibilityChange(false);
    };

    if (!visible) return null;

    return (
        <div
            className="fixed top-0 left-0 z-[60] flex w-full items-center overflow-hidden bg-gold text-sm text-black"
            style={{ height: "36px" }}
        >
            <div className="relative flex h-full flex-1 items-center overflow-hidden">
                <p className="animate-marquee inline-block px-8 pr-12">
                    <span className="mr-2 font-medium">Free Delivery Across All of Pakistan - New Arrivals Just Dropped! </span>
                    <Link
                        href="/gallery"
                        className="whitespace-nowrap font-bold underline underline-offset-2 transition-all hover:no-underline"
                    >
                        {"Shop Now ->"}
                    </Link>
                </p>
            </div>
            <button
                onClick={handleClose}
                style={{ marginRight: "10px" }}
                className="absolute top-0 right-0 bottom-0 z-10 flex cursor-pointer items-center bg-gradient-to-l from-gold via-gold to-transparent px-4 text-lg text-black/70 transition-colors hover:text-black"
                aria-label="Close announcement"
            >
                x
            </button>
        </div>
    );
}

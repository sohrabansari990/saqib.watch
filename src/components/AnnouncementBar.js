"use client";

import { useState } from "react";

export default function AnnouncementBar({ onVisibilityChange }) {
    const [visible, setVisible] = useState(true);

    const handleClose = () => {
        setVisible(false);
        if (onVisibilityChange) onVisibilityChange(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[60] bg-gold text-black text-sm flex items-center overflow-hidden"
            style={{ height: "36px" }}
        >
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                <p className="animate-marquee px-8 inline-block pr-12">
                    <span className="font-medium mr-2">🔥 Free Delivery Across All of Pakistan — New Arrivals Just Dropped! </span>
                    <a
                        href="#arrivals"
                        className="font-bold underline underline-offset-2 hover:no-underline transition-all whitespace-nowrap"
                    >
                        Shop Now →
                    </a>
                </p>
            </div>
            <button
                onClick={handleClose}
                style={{marginRight: "10px"}}
                className="absolute right-0 top-0 bottom-0 px-4  bg-gradient-to-l from-gold via-gold to-transparent text-black/70 hover:text-black transition-colors text-lg cursor-pointer z-10 flex items-center"
                aria-label="Close announcement"
            >
                ✕
            </button>
        </div>
    );
}

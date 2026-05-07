"use client";

import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useBanner } from "@/context/BannerContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

const BANNER_H_DESKTOP = 40;
const BANNER_H_MOBILE  = 32;

export default function SaleBanner() {
    const pathname = usePathname();
    const { setBannerHeight } = useBanner();
    const [visible, setVisible] = useState(true);
    const [sale, setSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [jiggle, setJiggle] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const intervalRef = useRef(null);
    const jiggleRef = useRef(null);

    // Track screen width
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const BANNER_H = isMobile ? BANNER_H_MOBILE : BANNER_H_DESKTOP;

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "settings", "sale"), (snap) => {
            if (snap.exists()) setSale(snap.data());
            else setSale(null);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        setBannerHeight(visible && sale?.active ? BANNER_H : 0);
    }, [visible, sale, setBannerHeight, BANNER_H]);

    useEffect(() => {
        if (!sale?.active || !sale?.endDate) { setTimeLeft(null); return; }
        const tick = () => {
            const diff = new Date(sale.endDate).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); clearInterval(intervalRef.current); return; }
            setTimeLeft({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
        };
        tick();
        intervalRef.current = setInterval(tick, 1000);
        return () => clearInterval(intervalRef.current);
    }, [sale]);

    useEffect(() => {
        jiggleRef.current = setInterval(() => {
            setJiggle(true);
            setTimeout(() => setJiggle(false), 600);
        }, 4500);
        return () => clearInterval(jiggleRef.current);
    }, []);

    if (!visible || !sale?.active || pathname?.startsWith("/admin")) return null;

    const pad = (n) => String(n).padStart(2, "0");
    const galleryUrl = sale.category ? `/gallery?category=${encodeURIComponent(sale.category)}` : "/gallery";

    // Responsive size tokens
    const nameSize    = isMobile ? "9px"  : "11px";
    const pillSize    = isMobile ? "9px"  : "11px";
    const pillPad     = isMobile ? "2px 10px" : "3px 14px";
    const timerFontSz = isMobile ? "9px"  : "11px";
    const timerBox    = isMobile ? "20px" : "26px";
    const timerH      = isMobile ? "16px" : "20px";
    const labelSz     = isMobile ? "5px"  : "7px";
    const shopSize    = isMobile ? "9px"  : "11px";
    const dotSize     = isMobile ? "8px"  : "10px";
    const rowGap      = isMobile ? "5px"  : "10px";

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 70,
            width: "100%",
            height: `${BANNER_H}px`,
            background: "linear-gradient(90deg, #1a1000 0%, #c9a96e 20%, #c9a96e 80%, #1a1000 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            {/* ── All content centered in one row ── */}
            <div style={{ display: "flex", alignItems: "center", gap: rowGap, justifyContent: "center" }}>

                {/* Offer name */}
                <span style={{ color: "#000", fontWeight: "bold", fontSize: nameSize, letterSpacing: "0.15em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {sale.name || "Sale"}
                </span>

                <span style={{ color: "rgba(0,0,0,0.4)", fontSize: dotSize }}>•</span>

                {/* Countdown blocks */}
                {timeLeft && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "3px" }}>
                        {[
                            { l: "DAYS", v: timeLeft.d },
                            { l: "HRS",  v: timeLeft.h },
                            { l: "MIN",  v: timeLeft.m },
                            { l: "SEC",  v: timeLeft.s },
                        ].map(({ l, v }) => (
                            <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(0,0,0,0.4)",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    fontSize: timerFontSz,
                                    borderRadius: "4px",
                                    minWidth: timerBox,
                                    height: timerH,
                                    padding: "0 3px",
                                    fontVariantNumeric: "tabular-nums",
                                    letterSpacing: "0.05em",
                                }}>
                                    {pad(v)}
                                </span>
                                <span style={{ fontSize: labelSz, color: "rgba(0,0,0,0.55)", fontWeight: "600", letterSpacing: "0.06em", marginTop: "1px" }}>
                                    {l}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <span style={{ color: "rgba(0,0,0,0.4)", fontSize: dotSize }}>•</span>

                {/* Jiggling discount pill */}
                <Link href={galleryUrl} style={{ textDecoration: "none" }}>
                    <span style={{
                        display: "inline-block",
                        background: "#DC2626",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: pillSize,
                        padding: pillPad,
                        borderRadius: "20px",
                        letterSpacing: "0.06em",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        animation: jiggle ? "saleJiggle 0.6s ease" : "none",
                    }}>
                        Upto {sale.discount}% Off
                    </span>
                </Link>

                <span style={{ color: "rgba(0,0,0,0.4)", fontSize: dotSize }}>•</span>

                {/* Shop Now — hidden on very small screens to save space */}
                {!isMobile && (
                    <Link href={galleryUrl} style={{
                        color: "#000",
                        fontWeight: "700",
                        fontSize: shopSize,
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                        letterSpacing: "0.1em",
                        whiteSpace: "nowrap",
                    }}>
                        Shop Now →
                    </Link>
                )}
            </div>

            {/* Close button */}
            <button
                onClick={() => setVisible(false)}
                aria-label="Close banner"
                style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(0,0,0,0.5)",
                    fontSize: isMobile ? "15px" : "18px",
                    lineHeight: 1,
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: "4px 6px",
                }}
            >
                ×
            </button>

            <style>{`
                @keyframes saleJiggle {
                    0%   { transform: translateX(0); }
                    15%  { transform: translateX(-5px); }
                    30%  { transform: translateX(5px); }
                    45%  { transform: translateX(-4px); }
                    60%  { transform: translateX(4px); }
                    75%  { transform: translateX(-2px); }
                    90%  { transform: translateX(2px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}

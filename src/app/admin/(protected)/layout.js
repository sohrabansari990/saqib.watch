"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function AdminLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const warnTimer = useRef(null);
    const logoutTimer = useRef(null);

    // Idle logout
    useEffect(() => {
        if (!user) return;
        const resetTimers = () => {
            if (warnTimer.current) clearTimeout(warnTimer.current);
            if (logoutTimer.current) clearTimeout(logoutTimer.current);

            warnTimer.current = setTimeout(() => {
                toast("You will be logged out in 60 seconds due to inactivity.");
            }, 14 * 60 * 1000); // 14 minutes

            logoutTimer.current = setTimeout(async () => {
                await logout?.();
                router.push("/admin/login");
            }, 15 * 60 * 1000);
        };

        const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
        events.forEach((evt) => window.addEventListener(evt, resetTimers));
        resetTimers();

        return () => {
            events.forEach((evt) => window.removeEventListener(evt, resetTimers));
            if (warnTimer.current) clearTimeout(warnTimer.current);
            if (logoutTimer.current) clearTimeout(logoutTimer.current);
        };
    }, [router, user, logout]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}

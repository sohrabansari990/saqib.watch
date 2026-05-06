"use client";
import { createContext, useContext, useState } from "react";

const BannerCtx = createContext({ bannerHeight: 0, setBannerHeight: () => {} });

export function BannerProvider({ children }) {
    const [bannerHeight, setBannerHeight] = useState(0);
    return (
        <BannerCtx.Provider value={{ bannerHeight, setBannerHeight }}>
            {children}
        </BannerCtx.Provider>
    );
}

export function useBanner() {
    return useContext(BannerCtx);
}

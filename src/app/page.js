"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
import BestSelling from "@/components/BestSelling";
import RecentMenWatches from "@/components/RecentMenWatches";
import RecentSportsWatches from "@/components/RecentSportsWatches";
import HomePreloader from "@/components/HomePreloader";

// Lazy-load below-fold components — they won't block hero paint
const CategoryCards = dynamic(() => import("@/components/CategoryCards"), {
    ssr: false,
});
const PromiseSection = dynamic(() => import("@/components/PromiseSection"), {
    ssr: false,
});
const TestimonialsSection = dynamic(
    () => import("@/components/TestimonialsSection"),
    { ssr: false }
);

const BrandsSection = dynamic(() => import("@/components/BrandsSection"), {
    ssr: false,
});
const BudgetWatchesSection = dynamic(() => import("@/components/BudgetWatchesSection"), {
    ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
    ssr: false,
});

/**
 * WRK-style Under-Curtain / Parallax Reveal:
 * 1. The main container is given a scroll track height of 200vh.
 * 2. The HeroSection (zIndex: 20) is absolute positioned at top: 0 inside this container.
 *    As the user scrolls, the HeroSection scrolls UP normally, lifting like a curtain.
 * 3. The NewArrivals section (zIndex: 10) is position: sticky at top: 0.
 *    Because its parent is at the top of the document, NewArrivals is *already* stuck at top: 0
 *    in the viewport under the hero.
 * 4. As the Hero scrolls up, it reveals the NewArrivals section sitting completely still
 *    and fully present behind it.
 * 5. Once the scroll exceeds 100vh (and the Hero is fully off-screen), the NewArrivals section
 *    unsticks and scrolls up naturally to reveal the Footer.
 */
export default function Home() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <>
            <HomePreloader />
            <Header />
            <main style={{ position: "relative" }}>
                
                {/* 600vh Parallax Reveal Container — extra 100vh for BestSelling text highlight pin */}
                <div style={{ position: "relative", height: "600vh" }}>
                    
                    {/* 5. Fixed bottom section revealed last: RecentSportsWatches (z-index 4) */}
                    <div style={{ position: "sticky", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 4 }}>
                        <RecentSportsWatches />
                    </div>

                    {/* 500vh wrapper (z-index 10) */}
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "500vh", zIndex: 10 }}>
                        
                        {/* 4. Fixed bottom section revealed 4th: RecentMenWatches (z-index 5) */}
                        <div style={{ position: "sticky", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 5 }}>
                            <RecentMenWatches />
                        </div>

                        {/* 400vh wrapper — extra 100vh so BestSelling is pinned & visible for 200vh instead of 100vh (z-index 10) */}
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "400vh", zIndex: 10 }}>
                            
                            {/* 3. Revealed second to last: Best Selling (z-index 10 inside wrapper) */}
                            <div style={{ position: "sticky", top: 0, left: 0, width: "100%", height: "100vh", zIndex: 10 }}>
                                <BestSelling />
                            </div>

                        {/* 200vh wrapper for the top two curtains (z-index 20) */}
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "200vh", zIndex: 20 }}>
                            
                            {/* 1. Rising top curtain: Hero Section (z-index 20 inside wrapper) */}
                            <div 
                                style={{ 
                                    position: "absolute", 
                                    top: 0, 
                                    left: 0, 
                                    width: "100%", 
                                    height: "100vh", 
                                    zIndex: 20, 
                                    overflow: "hidden",
                                    backgroundColor: "#000000"
                                }}
                            >
                                <HeroSection />
                            </div>

                            {/* 2. Middle curtain: New Arrivals (z-index 10 inside wrapper) */}
                            <div 
                                style={{ 
                                    position: "sticky", 
                                    top: 0, 
                                    left: 0, 
                                    width: "100%", 
                                    height: "100vh", 
                                    zIndex: 10, 
                                    overflow: "hidden", 
                                    display: "flex", 
                                    flexDirection: "column", 
                                    justifyContent: "flex-start",
                                    backgroundColor: "#000000",
                                    paddingTop: "12vh",
                                    paddingBottom: "8vh"
                                }}
                            >
                                <NewArrivals />
                            </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Below sections are commented out for focus, as requested */}
                
                <div style={{ position: "relative", zIndex: 9.5 }}>
                    <BrandsSection />
                </div>
                <div style={{ position: "relative", zIndex: 9.2 }}>
                    <BudgetWatchesSection />
                </div>
                {/* <div style={{ position: "relative", zIndex: 9.3 }}>
                    <CategoryCards />
                </div>
                <div style={{ position: "relative", zIndex: 9.4 }}>
                    <PromiseSection />
                </div> */}
                <div style={{ position: "relative", zIndex: 9.5 }}>
                    <TestimonialsSection />
                </div>

               

            </main>
            <Footer />
        </>
    );
}

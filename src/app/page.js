"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
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
const Heritage = dynamic(() => import("@/components/Heritage"), {
    ssr: false,
});
const Footer = dynamic(() => import("@/components/Footer"), {
    ssr: false,
});

export default function Home() {
    return (
        <>
            <HomePreloader />
            <Header />
            <main>
                <HeroSection />
                <NewArrivals />
                <CategoryCards />
                <PromiseSection />
                <TestimonialsSection />
                <Heritage />
            </main>
            <Footer />
        </>
    );
}

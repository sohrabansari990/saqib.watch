"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
import CategoryCards from "@/components/CategoryCards";
import PromiseSection from "@/components/PromiseSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Heritage from "@/components/Heritage";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

export default function Home() {
    const [barVisible, setBarVisible] = useState(true);

    return (
        <>
            <AnnouncementBar onVisibilityChange={setBarVisible} />
            <Header topOffset={barVisible ? 36 : 0} />
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

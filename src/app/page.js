import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
import CategoryCards from "@/components/CategoryCards";
import Heritage from "@/components/Heritage";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <NewArrivals />
        <CategoryCards />
        <Heritage />
      </main>
      <Footer />
    </>
  );
}

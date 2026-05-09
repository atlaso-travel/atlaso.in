import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrendingDestinations from "@/components/home/TrendingDestinations";
import HowItWorks from "@/components/home/HowItWorks";
import TopOperators from "@/components/home/TopOperators";
import WhyAtlaso from "@/components/home/WhyAtlaso";
import ComparisonPreview from "@/components/home/ComparisonPreview";
import Testimonials from "@/components/home/Testimonials";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrendingDestinations />
        <HowItWorks />
        <TopOperators />
        <WhyAtlaso />
        <ComparisonPreview />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrendingDestinations from "@/components/home/TrendingDestinations";
import HowItWorks from "@/components/home/HowItWorks";
import WhyAtlaso from "@/components/home/WhyAtlaso";
// import ComparisonPreview from "@/components/home/ComparisonPreview";
import TopOperators from "@/components/home/TopOperators";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CtaBanner from "@/components/home/CtaBanner";
// import HomeFacts from "@/components/home/HomeFacts";
import WebSiteSchema from "@/components/schema/WebSiteSchema";
import FaqSchema from "@/components/schema/FaqSchema";
import { buildMetadata, clamp, inr } from "@/lib/seo/meta";
import { getPlatformInsight } from "@/server/insights";
import { siteFaqs } from "@/data/faqs";

/** Shared social preview image for pages without an entity photo of their own. */
const OG_IMAGE =
  "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c?w=1200&q=80";

export async function generateMetadata(): Promise<Metadata> {
  const insight = await getPlatformInsight();

  return buildMetadata({
    title: clamp(
      `Compare India Tour Packages from ${insight.operators} Verified Operators — Atlaso`,
      70
    ),
    description: clamp(
      `Compare ${insight.packages} tour packages from ${insight.operators} Indian operators side by side. ` +
        `Prices from ${inr(insight.priceFrom)} per person — on average ${inr(insight.averageSaving)} below ` +
        `booking direct with the same operator.`,
      158
    ),
    path: "/",
    image: OG_IMAGE,
    imageAlt: "Compare Indian tour operators side by side on Atlaso",
  });
}

export default async function Home() {
  const insight = await getPlatformInsight();

  return (
    <>
      <WebSiteSchema />
      <FaqSchema items={siteFaqs} />

      {/* Floats over the hero photograph and goes solid once past it. The home
          page is the only route that opens on a full-bleed image, so it is the
          only one that asks for the transparent bar. */}
      <Navbar overlay />
      <main className="relative">
        <HeroSection />
        {/* Server-rendered factual summary — the first crawlable prose on the
            site, and the paragraph most likely to be quoted by an answer engine
            asked "what is Atlaso" or "how much do Indian tour packages cost". */}
        {/* <HomeFacts insight={insight} /> */}
        <TrendingDestinations />
        <HowItWorks />
        <WhyAtlaso />
        {/* <ComparisonPreview /> */}
        <TopOperators />
        <Testimonials />
        <FAQ />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}

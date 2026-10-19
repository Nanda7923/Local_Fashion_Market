import type { Metadata } from "next";

import NavBar from "@/app/products/components/nav-bar/NavBar";
import HeroSection from "@/app/products/components/main-sections/HeroSection"
import NewArrivalSection from "@/app/products/components/main-sections/NewArrivalSection";
import TrendingSection from "@/app/products/components/main-sections/TrendingSection";
import FeatureSection from "@/app/products/components/main-sections/FeatureSection";
import NewsletterSection from "@/app/products/components/main-sections/NewsletterSection";
import AvailableBrandSection from "@/app/products/components/main-sections/AvailableBrandSection";
import FooterSection from "@/app/products/components/main-sections/FooterSection";

export default function IndexPage() {
  return (
      <div >
          <NavBar/>
          <main>
              <HeroSection />
              <AvailableBrandSection/>
              <NewArrivalSection/>
              <TrendingSection/>
              <FeatureSection/>
              <NewsletterSection/>
              <FooterSection/>
          </main>
      </div>);
}

export const metadata: Metadata = {
  title: "Local_Fashion_World",
};

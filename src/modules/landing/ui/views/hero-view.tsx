"use client";

import { HeroSection } from "../components/hero-section";
import { FaqSection } from "../sections/faq-section";
import { Footer } from "../sections/footer-section";
import { ServiceSection } from "../sections/service-section";

export const HeroView = () => {
  return (
    <>
      <HeroSection />
      <ServiceSection />
      <FaqSection />
      <Footer />
    </>
  );
};

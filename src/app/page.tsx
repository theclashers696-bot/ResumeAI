import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TemplatesSection } from "@/components/landing/templates-section";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { StatsSection } from "@/components/landing/stats-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "ResumeAI — Create ATS-Friendly Resumes Powered by AI",
  description:
    "Build professional, ATS-optimized resumes in minutes with AI-powered suggestions, beautiful templates, and one-click PDF export. Trusted by 100,000+ professionals.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TemplatesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

import { BrandStrip } from "../components/LandingPage/BrandStrip";
import { FeaturesSection } from "../components/LandingPage/FeaturesSection";
import { FinalCtaSection } from "../components/LandingPage/FinalCtaSection";
import { HeroSection } from "../components/LandingPage/HeroSection";
import { HowItWorksSection } from "../components/LandingPage/HowItWorksSection";
import { PricingSection } from "../components/LandingPage/PricingSection";
import { ProblemSection } from "../components/LandingPage/ProblemSection";

export const LandingPage = () => {
  return (
    <div className="relative overflow-x-clip bg-[#060d14] pb-18 text-[#e9f0f4] dark:bg-[#060d14] dark:text-[#e9f0f4]">
      <div className="pointer-events-none absolute inset-0 z-1 grain-overlay" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(0,180,172,0.22),transparent_32%),radial-gradient(circle_at_78%_28%,rgba(0,132,122,0.2),transparent_38%),linear-gradient(180deg,rgba(5,11,18,0.96)_0%,rgba(5,12,20,1)_70%)]" />
        <div className="absolute inset-y-0 left-[34%] w-px bg-[#11413f]/35" />
        <div className="absolute inset-y-0 left-[68%] w-px bg-[#11413f]/25" />
        <div className="absolute inset-x-0 top-[44%] h-px bg-[#11413f]/22" />
      </div>

      <HeroSection />

      <BrandStrip />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />

      <PricingSection />
      <FinalCtaSection />
    </div>
  );
};

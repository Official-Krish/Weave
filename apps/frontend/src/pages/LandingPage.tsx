import { FeaturesSection } from "@/components/LandingPage/FeaturesSection";
import { FinalCtaSection } from "@/components/LandingPage/FinalCtaSection";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { HowItWorksSection } from "@/components/LandingPage/HowItWorksSection";
import { HLSPrivacySection } from "@/components/LandingPage/HLSPrivacySection";
import { PricingSection } from "@/components/LandingPage/PricingSection";
import { ProblemSection } from "@/components/LandingPage/ProblemSection";
import { QualityFormatsSection } from "@/components/LandingPage/QualityFormatsSection";
import { VideoEditorPreviewSection } from "@/components/LandingPage/VideoEditorPreviewSection";

export const LandingPage = () => {
  return (
    <div className="relative isolate overflow-x-clip bg-background pb-18 text-foreground">
      <div className="relative z-10">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <HLSPrivacySection />
        <QualityFormatsSection />
        <VideoEditorPreviewSection />

        <PricingSection />
        <FinalCtaSection />
      </div>
    </div>
  );
};

import { FeaturesSection } from "@/components/LandingPage/FeaturesSection";
import { FinalCtaSection } from "@/components/LandingPage/FinalCtaSection";
import { HeroSection } from "@/components/LandingPage/HeroSection";
import { HowItWorksSection } from "@/components/LandingPage/HowItWorksSection";
import { HLSPrivacySection } from "@/components/LandingPage/HLSPrivacySection";
import { PricingSection } from "@/components/LandingPage/PricingSection";
import { ProblemSection } from "@/components/LandingPage/ProblemSection";
import { QualityFormatsSection } from "@/components/LandingPage/QualityFormatsSection";
import { VideoEditorPreviewSection } from "@/components/LandingPage/VideoEditorPreviewSection";
import { motion } from "motion/react";

export const LandingPage = () => {
  return (
    <div className="relative isolate overflow-x-clip bg-background pb-18 text-foreground">
      <div className="pointer-events-none absolute inset-0 z-1 grain-overlay" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Main black base with very soft amber tint */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 74% 18%, rgba(245,166,35,0.04) 0%, transparent 30%), linear-gradient(180deg, rgba(8,8,9,1) 0%, rgba(11,10,10,1) 55%, rgba(7,7,8,1) 100%)",
          }}
        />

        {/* Tiny moving amber circles */}
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "16%",
            left: "10%",
            width: "180px",
            height: "180px",
            background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, rgba(245,166,35,0.02) 35%, transparent 72%)",
            filter: "blur(8px)",
          }}
          animate={{ x: [0, 18, -12, 0], y: [0, -14, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "42%",
            right: "12%",
            width: "220px",
            height: "220px",
            background: "radial-gradient(circle, rgba(245,166,35,0.07) 0%, rgba(245,166,35,0.02) 38%, transparent 74%)",
            filter: "blur(10px)",
          }}
          animate={{ x: [0, -20, 10, 0], y: [0, 16, -8, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: "8%",
            left: "42%",
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, rgba(245,166,35,0.065) 0%, rgba(245,166,35,0.02) 36%, transparent 72%)",
            filter: "blur(9px)",
          }}
          animate={{ x: [0, 14, -10, 0], y: [0, -12, 8, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-2">
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

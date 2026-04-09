import { FeatureCard } from "../components/FeatureCard";
import { PageShell } from "../components/PageShell";

export const LandingPage = () => {
  return (
    <div className="space-y-6">
      <PageShell
        eyebrow="Foundation"
        title="Record meetings from the participant device, not the network."
        description="This fresh frontend is the clean base for the new architecture. We are keeping the product story simple: live meetings, local chunk uploads, merged recordings, and future editing on the same platform."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="motion-rise motion-delay-1">
            <FeatureCard
              title="Local-first capture"
              description="Each participant records locally so unstable internet does not ruin the final output."
            />
          </div>
          <div className="motion-rise motion-delay-2">
            <FeatureCard
              title="Reliable ingestion"
              description="Chunk metadata and sequence-driven ordering make late uploads and reconnects safe."
            />
          </div>
          <div className="motion-rise motion-delay-3">
            <FeatureCard
              title="Editing-ready assets"
              description="We preserve participant tracks and timeline metadata so editor capabilities can ship cleanly."
            />
          </div>
        </div>
      </PageShell>
    </div>
  );
};

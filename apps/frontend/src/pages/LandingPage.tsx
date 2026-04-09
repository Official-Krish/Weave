import { FeatureCard } from "../components/FeatureCard";

export const LandingPage = () => {
  return (
    <div className="space-y-6">
      <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Foundation
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Record meetings from the participant device, not the network.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          This fresh frontend is the clean base for the new architecture. We are keeping the product story simple: live meetings, local chunk uploads, merged recordings, and future editing on the same platform.
        </p>
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
      </section>
    </div>
  );
};

import { InfoBlock } from "../components/InfoBlock";
import { PageShell } from "../components/PageShell";

export function ProductPage() {
  return (
    <PageShell
      eyebrow="Product"
      title="A simpler v1 product surface around a stronger media pipeline."
      description="The frontend stays light for now. The real work in phase 1 is backend recording state, deterministic chunk uploads, and a merge pipeline that produces reliable outputs."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="motion-rise motion-delay-1">
          <InfoBlock
            title="What v1 should communicate"
            items={[
              "Meetings are easy to start and join.",
              "Recording quality comes from local device capture.",
              "Uploads continue safely even with unstable internet.",
              "Recordings move through processing into playback and editing.",
            ]}
          />
        </div>
        <div className="motion-rise motion-delay-2">
          <InfoBlock
            title="What we are not polishing yet"
            items={[
              "Final visual identity",
              "Rich editor interactions",
              "Advanced dashboard filters",
              "Complex editor choreography",
            ]}
          />
        </div>
      </div>
    </PageShell>
  );
}

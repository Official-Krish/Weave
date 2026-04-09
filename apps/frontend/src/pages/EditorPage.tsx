import { InfoBlock } from "../components/InfoBlock";
import { PageShell } from "../components/PageShell";

export function EditorPage() {
  return (
    <PageShell
      eyebrow="Editor"
      title="The editor route exists now so the backend can be designed for it from day one."
      description="We are not building the final editor UI yet, but this route represents the future surface for participant tracks, trims, lane muting, and export jobs."
    >
      <div className="motion-rise motion-delay-2">
        <InfoBlock
          title="Editor assumptions"
          items={[
            "Each participant gets a stitched source track.",
            "Timeline metadata is stored server-side.",
            "Exports are generated asynchronously.",
            "Frontend editing state can stay local until the editor becomes complex.",
          ]}
        />
      </div>
    </PageShell>
  );
}

import { PageShell } from "../components/PageShell";
import { StatusCard } from "../components/StatusCard";

export function RecordingsPage() {
  return (
    <PageShell
      eyebrow="Recordings"
      title="One place for processing, playback, and final exports."
      description="This route will later show processing states, HLS playback, MP4 downloads, and thumbnails. For now it marks the destination for the new recording asset flow."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="motion-rise motion-delay-1">
          <StatusCard label="Queued" value="Meeting ended" />
        </div>
        <div className="motion-rise motion-delay-2">
          <StatusCard label="Processing" value="Merge in progress" />
        </div>
        <div className="motion-rise motion-delay-3">
          <StatusCard label="Ready" value="Playback + assets" />
        </div>
      </div>
    </PageShell>
  );
}

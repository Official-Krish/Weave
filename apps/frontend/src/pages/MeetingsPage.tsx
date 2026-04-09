import { FeatureCard } from "../components/FeatureCard";
import { PageShell } from "../components/PageShell";

export function MeetingsPage() {
  return (
    <PageShell
      eyebrow="Meetings"
      title="Phase 1 starts here: meeting lifecycle and recording state."
      description="This page is a placeholder for create, join, and active meeting flows. We will connect it to the backend once the new recording-control API replaces the WebSocket layer."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="motion-rise motion-delay-1">
          <FeatureCard
            title="Create meeting"
            description="Host creates a room, invites participants, and becomes the source of truth for recording control."
          />
        </div>
        <div className="motion-rise motion-delay-2">
          <FeatureCard
            title="Join meeting"
            description="Participants fetch meeting state from the backend and upload local chunks during or after the session."
          />
        </div>
      </div>
    </PageShell>
  );
}

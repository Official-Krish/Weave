import { FeatureCard } from "../components/FeatureCard";

export function MeetingsPage() {
  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Meetings
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Phase 1 starts here: meeting lifecycle and recording state.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        This page is a placeholder for create, join, and active meeting flows. We will connect it to the backend once the new recording-control API replaces the WebSocket layer.
      </p>
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
    </section>
  );
}

import { StatusCard } from "../components/StatusCard";

export function RecordingsPage() {
  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Recordings
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        One place for processing, playback, and final exports.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        This route will later show processing states, HLS playback, MP4 downloads, and thumbnails. For now it marks the destination for the new recording asset flow.
      </p>
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
    </section>
  );
}

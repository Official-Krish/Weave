export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Built for heavy hitters</p>
          <h2 className="mt-3 font-syne text-3xl font-bold text-foreground sm:text-4xl">Production-grade where it matters.</h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          The product should feel calm on the surface and serious underneath:
          resilient capture, predictable processing, and assets that still make
          sense after the call ends.
        </p>
      </div>
      <div className="grid auto-rows-[180px] gap-4 md:grid-cols-12 sm:auto-rows-[200px]">
        <article className="relative overflow-hidden rounded-[1.5rem] border border-border/75 bg-[linear-gradient(135deg,rgba(16,115,108,0.16)_0%,rgba(255,255,255,0.2)_38%,rgba(255,255,255,0.1)_100%)] p-6 dark:bg-[linear-gradient(135deg,rgba(16,115,108,0.22)_0%,rgba(15,23,42,0.38)_45%,rgba(15,23,42,0.24)_100%)] md:col-span-8">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(16,115,108,0.08))]" />
          <div className="absolute right-5 top-5 rounded-full border border-primary/35 bg-background/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Universal compatibility
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <h3 className="font-headline text-2xl font-bold text-foreground">Lossless local recording, then cloud delivery.</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                Record in the browser with deterministic chunk uploads, merge
                after the session, stream through HLS, and keep the project ready
                for the in-platform editor.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Chunk sequencing", "Merge pipeline", "Playback assets"].map((item) => (
                <div key={item} className="rounded-xl border border-border/70 bg-background/65 px-4 py-3 text-sm text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </article>
        <article className="rounded-[1.5rem] border border-primary/35 bg-primary/12 p-6 text-foreground md:col-span-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Privacy first</p>
          <h3 className="mt-3 font-headline text-xl font-bold">Local-only mode for sensitive workflows.</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Keep high-stakes interviews and internal reviews off the network until
            your team is ready to publish them.
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-border/75 bg-card/75 p-6 md:col-span-4">
          <h4 className="font-headline text-lg font-bold text-foreground">Hardware-level security posture</h4>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Encrypted uploads, recoverable chunk history, and fewer single points
            of failure than cloud-only recording stacks.
          </p>
        </article>
        <article className="flex items-center justify-between gap-8 rounded-[1.5rem] border border-border/75 bg-card/75 p-6 md:col-span-8">
          <div>
            <h4 className="font-headline text-xl font-bold text-foreground">Resilience engine</h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Crash-safe chunk capture and status-driven processing keep the path
              from live call to final export understandable and recoverable.
            </p>
          </div>
          <div className="flex h-18 w-18 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-2xl font-black text-primary">R</div>
        </article>
      </div>
    </section>
  );
}

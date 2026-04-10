export function ProblemSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[0.9fr_1.1fr] md:px-8">
      <div className="rounded-[1.6rem] border border-destructive/30 bg-destructive/8 p-7 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
        <h3 className="font-headline text-xl font-bold text-destructive">The bad internet nightmare</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Cloud-only recording drops frames, smears voices, and ruins the exact moments you needed cleanest. One unstable participant can wreck the entire deliverable.
        </p>
        <div className="mt-6 flex h-12 items-center gap-1 rounded-xl border border-destructive/30 bg-background/70 px-4">
          <div className="h-6 w-1 rounded-full bg-destructive/75" />
          <div className="h-8 w-1 rounded-full bg-destructive/75" />
          <div className="h-3 w-1 rounded-full bg-destructive/30" />
          <div className="h-9 w-1 rounded-full bg-destructive/75" />
          <div className="h-4 w-1 rounded-full bg-destructive/75" />
          <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.16em] text-destructive">Dropped frames</span>
        </div>
      </div>
      <div className="space-y-6">
        <h2 className="font-syne text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          Your bandwidth should not dictate your quality.
        </h2>
        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          Weave captures raw participant video to disk first and treats the network like transport, not truth. That means your final output stays sharp, stable, and useful for post-production.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Local-first source", "High bitrate footage survives weak upload conditions."],
            ["Safer post workflow", "Merged output and participant assets remain editor-friendly."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-[1.2rem] border border-border/70 bg-card/80 p-4">
              <h3 className="font-headline text-base font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductPage() {
  const v1Items = [
    "Meetings are easy to start and join.",
    "Recording quality comes from local device capture.",
    "Uploads continue safely even with unstable internet.",
    "Recordings move through processing into playback and editing.",
  ];

  const notNowItems = [
    "Final visual identity",
    "Rich editor interactions",
    "Advanced dashboard filters",
    "Complex editor choreography",
  ];

  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Product
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        A simpler v1 product surface around a stronger media pipeline.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        The frontend stays light for now. The real work in phase 1 is backend recording state, deterministic chunk uploads, and a merge pipeline that produces reliable outputs.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="motion-rise motion-delay-1">
          <div className="motion-rise rounded-[1.5rem] border border-border/70 bg-secondary/35 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-accent/25">
            <h2 className="text-lg font-semibold text-foreground">What v1 should communicate</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {v1Items.map((item) => (
                <li key={item} className="rounded-2xl border border-border/60 bg-card/55 px-4 py-3 transition-colors duration-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="motion-rise motion-delay-2">
          <div className="motion-rise rounded-[1.5rem] border border-border/70 bg-secondary/35 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-accent/25">
            <h2 className="text-lg font-semibold text-foreground">What we are not polishing yet</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {notNowItems.map((item) => (
                <li key={item} className="rounded-2xl border border-border/60 bg-card/55 px-4 py-3 transition-colors duration-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

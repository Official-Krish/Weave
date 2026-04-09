export function EditorPage() {
  const editorAssumptions = [
    "Each participant gets a stitched source track.",
    "Timeline metadata is stored server-side.",
    "Exports are generated asynchronously.",
    "Frontend editing state can stay local until the editor becomes complex.",
  ];

  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Editor
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        The editor route exists now so the backend can be designed for it from day one.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        We are not building the final editor UI yet, but this route represents the future surface for participant tracks, trims, lane muting, and export jobs.
      </p>
      <div className="motion-rise motion-delay-2">
        <div className="motion-rise rounded-[1.5rem] border border-border/70 bg-secondary/35 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-accent/25">
          <h2 className="text-lg font-semibold text-foreground">Editor assumptions</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            {editorAssumptions.map((item) => (
              <li key={item} className="rounded-2xl border border-border/60 bg-card/55 px-4 py-3 transition-colors duration-300">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

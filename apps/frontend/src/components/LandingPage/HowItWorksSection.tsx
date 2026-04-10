export function HowItWorksSection() {
  return (
    <section id="howitworks" className="bg-card/35 px-6 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">How it works</p>
          <h2 className="mt-3 font-syne text-3xl font-bold text-foreground sm:text-4xl">Three steps to perfection.</h2>
          <div className="signature-glow mx-auto mt-6 h-1 w-20 rounded-full opacity-90" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {["Record Local", "Silent Sync", "Instant Export"].map((title, i) => (
            <article
              key={title}
              className={`rounded-[1.4rem] border p-6 text-center ${i === 1 ? "border-primary/45 bg-primary/7 shadow-[0_0_45px_rgba(16,115,108,0.16)]" : "border-border/70 bg-card/75"}`}
            >
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-base font-black ${i === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>{i + 1}</div>
              <h3 className="font-headline text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {i === 0 && "Capture participant video on-device first so weak internet never becomes the master recording."}
                {i === 1 && "Upload encrypted chunks quietly in the background while the call keeps moving."}
                {i === 2 && "Finish the meeting and move straight into merged playback, downloads, and the future editor."}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

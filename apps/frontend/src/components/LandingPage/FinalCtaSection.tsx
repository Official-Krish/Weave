export function FinalCtaSection() {
  return (
    <section className="px-6 pb-8 sm:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-primary/35 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_26%,white)_0%,color-mix(in_oklab,var(--primary)_16%,var(--background))_56%,color-mix(in_oklab,var(--accent)_28%,var(--background))_100%)] px-7 py-14 text-center shadow-[0_20px_60px_rgba(15,23,42,0.14)] sm:px-12 dark:bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_32%,black)_0%,color-mix(in_oklab,var(--primary)_14%,var(--background))_56%,color-mix(in_oklab,var(--accent)_26%,var(--background))_100%)]">
        <h2 className="font-syne text-3xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
          Your best recordings start local.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          Give your team a landing experience that promises quality and a product
          experience that actually protects it.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a className="rounded-full bg-foreground px-7 py-3 font-headline text-sm font-bold text-background transition hover:opacity-92" href="/signup">
            Start free
          </a>
          <a className="rounded-full border border-border bg-background/70 px-7 py-3 font-headline text-sm font-bold text-foreground transition hover:bg-secondary/75" href="/meetings">
            Explore the product
          </a>
        </div>
      </div>
    </section>
  );
}

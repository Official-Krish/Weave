const brandStrip = [
  "CREATOR HUB",
  "PIXEL STUDIO",
  "LUME MEDIA",
  "VELOCITY",
  "NEXUS TV",
  "ORBIT RECORDINGS",
];

export function BrandStrip() {
  return (
    <section className="overflow-hidden border-y border-border/65 bg-card/40 py-6">
      <div className="animate-scroll flex w-max gap-14 px-8">
        {[...brandStrip, ...brandStrip].map((name, index) => (
          <span
            key={`${name}-${index}`}
            className="font-headline text-sm font-bold tracking-[0.22em] text-muted-foreground/75 transition duration-300 hover:text-primary"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

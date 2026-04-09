export function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="motion-rise rounded-[1.5rem] border border-border/70 bg-secondary/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:bg-accent/25">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
    </article>
  );
}

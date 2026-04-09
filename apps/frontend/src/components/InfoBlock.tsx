export function InfoBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="motion-rise rounded-[1.5rem] border border-border/70 bg-secondary/35 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-accent/25">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="rounded-2xl border border-border/60 bg-card/55 px-4 py-3 transition-colors duration-300">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

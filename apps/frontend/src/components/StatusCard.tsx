export function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="motion-rise rounded-[1.5rem] border border-border/70 bg-secondary/35 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-accent/25">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-4 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

import type { PropsWithChildren } from "react";

type PageShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
      {children ? <div className="motion-rise motion-delay-1 mt-10">{children}</div> : null}
    </section>
  );
}

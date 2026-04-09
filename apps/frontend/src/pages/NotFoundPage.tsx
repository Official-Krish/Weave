import { Link, useRouteError } from "react-router-dom";

export function NotFoundPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen px-5 py-6 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Missing
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            This page does not exist in the new frontend yet.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {error instanceof Error
              ? error.message
              : "The route structure is in place, so we can expand cleanly during phase 1."}
          </p>
          <Link
            to="/"
            className="motion-rise motion-delay-2 mt-10 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
          >
            Back home
          </Link>
        </section>
      </div>
    </div>
  );
}

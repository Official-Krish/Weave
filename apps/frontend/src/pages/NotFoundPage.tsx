import { Link, useRouteError } from "react-router-dom";
import { PageShell } from "../components/PageShell";

export function NotFoundPage() {
  const error = useRouteError();

  return (
    <div className="min-h-screen px-5 py-6 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageShell
          eyebrow="Missing"
          title="This page does not exist in the new frontend yet."
          description={
            error instanceof Error
              ? error.message
              : "The route structure is in place, so we can expand cleanly during phase 1."
          }
        >
          <Link
            to="/"
            className="motion-rise motion-delay-2 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105"
          >
            Back home
          </Link>
        </PageShell>
      </div>
    </div>
  );
}

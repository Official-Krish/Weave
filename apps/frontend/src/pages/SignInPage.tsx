import { PageShell } from "../components/PageShell";

export function SignInPage() {
  return (
    <PageShell
      eyebrow="Access"
      title="Basic auth placeholder for the new app."
      description="This is intentionally plain. We can plug in the existing auth backend or redesign the auth flow later without carrying over the old frontend structure."
    >
      <div className="motion-rise motion-delay-2 max-w-md space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/85 focus:border-primary focus:ring-2 focus:ring-primary/35"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/85 focus:border-primary focus:ring-2 focus:ring-primary/35"
        />
        <button className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_10px_20px_rgba(16,115,108,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105">
          Continue
        </button>
      </div>
    </PageShell>
  );
}

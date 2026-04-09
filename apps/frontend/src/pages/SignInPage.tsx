export function SignInPage() {
  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Access
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Basic auth placeholder for the new app.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        This is intentionally plain. We can plug in the existing auth backend or redesign the auth flow later without carrying over the old frontend structure.
      </p>
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
    </section>
  );
}

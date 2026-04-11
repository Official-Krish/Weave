import { HoverArrowButton } from "../ui/hover-arrow-button";

export function HeroSection() {
  return (
    <section className="relative isolate h-screen w-full overflow-hidden">
      <img
        src="/hero.png"
        alt="Hero background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/35 to-transparent" />

      <div className="relative z-10 flex h-full items-end px-6 sm:px-10 lg:px-16 pb-24">
        <div className="relative z-40 p-4 md:p-4">
          <h1 className="max-w-3xl text-3xl font-medium tracking-tight sm:text-4xl md:text-6xl lg:text-6xl text-neutral-200">
            Reliable Quality Recording, Even on Unstable Networks
          </h1>
          <p className="mt-4 max-w-xl text-base md:mt-6 md:text-lg text-neutral-400">
            Weave is built to remove network reliability as a blocker for professional-grade recordings. Local chunk capture, resilient uploads, and smart merging protect recording quality even when live call conditions are inconsistent.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <HoverArrowButton href="/signup" label="Try for free" />

            <a
              href="/docs"
              className="inline-flex h-12 items-center rounded-xl border border-transparent px-1 text-sm font-medium text-white/85 transition hover:text-white"
            >
              Read Documentation
              <span className="ml-2 text-base">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
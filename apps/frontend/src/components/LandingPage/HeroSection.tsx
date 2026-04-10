import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto max-w-7xl px-6 pb-18 pt-8 sm:px-8 md:pt-10"
    >
      <div className="grid items-center gap-10 md:grid-cols-[1.06fr_0.94fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Desktop version 2.0 now live
          </div>
          <h1 className="font-syne text-4xl font-extrabold leading-[0.9] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Record
            <br />
            Locally.
            <br />
            <span className="bg-[linear-gradient(135deg,#f2be61_0%,#e69331_62%,#ce6a20_100%)] bg-clip-text text-transparent">
              Deliver
            </span>{" "}
            Perfectly.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Studio-grade calls and recordings even when bandwidth falls apart.
            Weave captures locally first, syncs intelligently, and gives teams
            a clean path from conversation to final asset.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-headline text-sm font-bold text-primary-foreground shadow-[0_10px_28px_rgba(16,115,108,0.25)] transition hover:-translate-y-0.5 hover:brightness-105"
              href="/signup"
            >
              Start recording better
              <ArrowRight className="h-4 w-4" />
            </a>
            <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 font-headline text-sm font-bold text-foreground transition hover:bg-secondary/75">
              <Play className="h-4 w-4" />
              Watch the workflow
            </button>
          </div>
          <div className="grid max-w-xl gap-3 pt-2 sm:grid-cols-3">
            {[
              { stat: "4K local", label: "recording on each machine" },
              { stat: "HLS-ready", label: "delivery after merge" },
              { stat: "Edit later", label: "participant assets preserved" },
            ].map((item) => (
              <div
                key={item.stat}
                className="rounded-2xl border border-border/80 bg-card/80 p-3"
              >
                <p className="font-syne text-lg font-bold text-foreground">{item.stat}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

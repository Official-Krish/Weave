import { motion } from "motion/react";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    tag: "GET STARTED",
    price: { monthly: "0", annual: "0" },
    suffix: "forever",
    desc: "For solo creators testing the pipeline.",
    cta: "Start for free",
    featured: false,
    points: [
      "5 hours recording / month",
      "Up to 2 participants",
      "720p export",
      "7-day storage",
      "HLS encryption",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tag: "MOST POPULAR",
    price: { monthly: "24", annual: "19" },
    suffix: "/ month",
    desc: "For professionals who record regularly and need full quality.",
    cta: "Start Pro trial",
    featured: true,
    points: [
      "Unlimited recording hours",
      "Up to 10 participants",
      "4K ProRes export",
      "90-day storage",
      "HLS encryption",
      "Built-in editor",
      "Multi-format export",
      "Priority support",
    ],
  },
  {
    id: "team",
    name: "Team",
    tag: "FOR STUDIOS",
    price: { monthly: "79", annual: "64" },
    suffix: "/ month",
    desc: "For studios and teams with high-volume recording needs.",
    cta: "Talk to us",
    featured: false,
    points: [
      "Everything in Pro",
      "Unlimited participants",
      "Shared workspace",
      "Admin controls",
      "1-year storage",
      "Dedicated support",
      "Custom integrations",
    ],
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="px-6 py-28 sm:px-8 border-b border-neutral-800">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#F5A623]/70 mb-4">
            Pricing
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Simple pricing.<br />No surprises.
            </h2>

            {/* Billing toggle */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className={`text-sm transition-colors ${!annual ? "text-white/70" : "text-white/30"}`}>
                Monthly
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className="relative w-12 h-6 rounded-full transition-colors duration-300"
                style={{ background: annual ? "rgba(245,166,35,0.3)" : "rgba(255,255,255,0.1)" }}
              >
                <motion.div
                  animate={{ x: annual ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute top-1 w-4 h-4 rounded-full"
                  style={{ background: annual ? "#F5A623" : "rgba(255,255,255,0.5)" }}
                />
              </button>
              <span className={`text-sm transition-colors ${annual ? "text-white/70" : "text-white/30"}`}>
                Annual
              </span>
              {annual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(245,166,35,0.12)",
                    color: "#F5A623",
                    border: "1px solid rgba(245,166,35,0.25)"
                  }}
                >
                  SAVE 20%
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Plans — asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr_1fr] gap-4 md:items-stretch">
          {plans.map((plan, i) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            const isPro = plan.featured;
            const isTeam = plan.id === "team";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-col p-8 rounded-2xl overflow-hidden"
                style={{
                  background: isPro
                    ? "rgba(245,166,35,0.07)"
                    : "rgba(255,255,255,0.03)",
                  border: isPro
                    ? "1px solid rgba(245,166,35,0.25)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isPro
                    ? "0 0 60px rgba(245,166,35,0.08), inset 0 1px 0 rgba(245,166,35,0.15)"
                    : "none",
                }}
              >
                {/* Subtle top glow for Pro */}
                {isPro && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.6), transparent)" }}
                  />
                )}

                {/* Plan tag */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="text-[10px] font-bold tracking-[0.2em] uppercase"
                    style={{ color: isPro ? "#F5A623" : "rgba(255,255,255,0.25)" }}
                  >
                    {plan.tag}
                  </span>
                  {isPro && (
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "#F5A623" }}
                    />
                  )}
                </div>

                {/* Plan name */}
                <h3 className="text-xl font-bold text-white mb-4">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-xs font-bold"
                      style={{ color: isPro ? "rgba(245,166,35,0.6)" : "rgba(255,255,255,0.25)" }}
                    >
                      $
                    </span>
                    <motion.span
                      key={`${plan.id}-${annual}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-5xl font-black tracking-tight"
                      style={{ color: isPro ? "#F5A623" : "white" }}
                    >
                      {price}
                    </motion.span>
                    <span className="text-sm text-white/25 ml-1">
                      {plan.suffix}
                    </span>
                  </div>
                </div>

                {/* Desc */}
                <p className="text-sm text-white/35 leading-relaxed mb-8 border-b border-white/8 pb-8">
                  {plan.desc}
                </p>

                {/* Feature list */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <svg
                        className="w-3.5 h-3.5 mt-0.5 shrink-0"
                        viewBox="0 0 14 14" fill="none"
                        style={{ color: isPro ? "#F5A623" : "rgba(255,255,255,0.3)" }}
                      >
                        <path
                          d="M2 7l3.5 3.5L12 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm text-white/50 leading-snug">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={
                    isPro
                      ? {
                          background: "#F5A623",
                          color: "#0c0c0e",
                        }
                      : isTeam
                      ? {
                          background: "transparent",
                          color: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                  }
                >
                  {plan.cta}
                </button>

              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center text-xs text-white/15 tracking-wide">
          All plans include HLS encryption and local-first recording. No credit card required to start.
        </p>

      </div>
    </section>
  );
}

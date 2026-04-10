import { motion } from "motion/react";

const pricing = [
  {
    name: "Starter",
    cost: "$0",
    suffix: "/mo",
    desc: "For occasional creators and quick captures.",
    cta: "Start for Free",
    featured: false,
    points: ["1080p Recording", "5GB Cloud Storage", "Community Support"],
  },
  {
    name: "Pro Artist",
    cost: "$19",
    suffix: "/mo",
    desc: "For power users who demand the highest quality.",
    cta: "Get Pro Access",
    featured: true,
    points: ["4K 60FPS ProRes", "Unlimited Cloud Storage", "HLS Resilience Engine"],
  },
  {
    name: "Enterprise",
    cost: "Custom",
    suffix: "",
    desc: "For teams, agencies, and large-scale operations.",
    cta: "Contact Sales",
    featured: false,
    points: ["SSO and SAML Login", "Custom Branding", "Dedicated Support"],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Pricing</p>
        <h2 className="mt-3 font-syne text-3xl font-bold text-foreground sm:text-4xl">Simple, transparent pricing.</h2>
      </motion.div>
      <div className="mt-10 grid gap-5 md:grid-cols-3 md:items-end">
        {pricing.map((plan, index) => (
          <motion.article
            key={plan.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
            className={`flex flex-col gap-6 rounded-[1.4rem] border p-6 ${plan.featured ? "border-primary/55 bg-primary/7 shadow-[0_0_45px_rgba(16,115,108,0.18)] md:scale-[1.02]" : "border-border/75 bg-card/75"}`}
          >
            <div>
              <h3 className={`font-headline text-lg font-bold ${plan.featured ? "text-primary" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <p className="mt-2 font-syne text-4xl font-black text-foreground">
                {plan.cost}
                {plan.suffix ? <span className="ml-1 text-sm font-medium text-muted-foreground">{plan.suffix}</span> : null}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.desc}</p>
            </div>
            <ul className="space-y-2.5 text-sm text-foreground">
              {plan.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
            <button
              className={`mt-auto rounded-xl py-3 text-xs font-bold uppercase tracking-[0.16em] transition ${plan.featured ? "bg-primary text-primary-foreground hover:brightness-105" : "border border-border text-foreground hover:bg-secondary/70"}`}
            >
              {plan.cta}
            </button>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

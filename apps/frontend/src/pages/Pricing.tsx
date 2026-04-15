import { ComingSoonModal } from "@/components/ComingSoonModal";
import { PricingCSS } from "@/components/Styles";
import { Check } from "lucide-react";
import { useState } from "react";

const PLANS = [
  {
    tag: "Get started",
    featured: false,
    name: "Free",
    monthly: 0,
    annual: 0,
    period: "forever",
    desc: "For solo creators testing the pipeline.",
    features: [
      "5 hours recording / month",
      "Up to 2 participants",
      "720p export",
      "7-day storage",
      "HLS encryption",
    ],
    cta: "Start for free",
    goldCta: false,
  },
  {
    tag: "Most popular",
    featured: true,
    name: "Pro",
    monthly: 24,
    annual: 19,
    period: "/ month",
    desc: "For professionals who record regularly and need full quality.",
    features: [
      "Unlimited recording hours",
      "Up to 10 participants",
      "4K ProRes export",
      "90-day storage",
      "HLS encryption",
      "Built-in editor",
      "Multi-format export",
      "Priority support",
    ],
    cta: "Start Pro trial",
    goldCta: true,
  },
  {
    tag: "For studios",
    featured: false,
    name: "Team",
    monthly: 79,
    annual: 64,
    period: "/ month",
    desc: "For studios and teams with high-volume recording needs.",
    features: [
      "Everything in Pro",
      "Unlimited participants",
      "Shared workspace",
      "Admin controls",
      "1-year storage",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Talk to us",
    goldCta: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <>
      <style>{PricingCSS}</style>
      <div className="wp-root">
        <div className="wp-wrap">

          {/* Hero */}
          <div className="wp-hero">
            <p className="wp-eyebrow">
              <span className="wp-dot" />
              Pricing
            </p>
            <h1 className="wp-h1">
              No surprises.<br />
              <span>Simple pricing.</span>
            </h1>
            <p className="wp-sub">
              Record at full quality for any team size. Cancel anytime.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="wp-toggle-row">
            <span className={`wp-tog-label ${!annual ? "active" : ""}`}>Monthly</span>
            <div
              className="wp-toggle-wrap"
              onClick={() => setAnnual((v) => !v)}
              role="switch"
              aria-checked={annual}
            >
              <div className={`wp-toggle-track ${annual ? "on" : ""}`} />
              <div className={`wp-toggle-thumb ${annual ? "on" : ""}`} />
            </div>
            <span className={`wp-tog-label ${annual ? "active" : ""}`}>Annual</span>
            <span className={`wp-save-badge ${annual ? "show" : ""}`}>Save 20%</span>
          </div>

          {/* Cards */}
          <div className="wp-grid">
            {PLANS.map((plan) => {
              const price = annual ? plan.annual : plan.monthly;
              const annualTotal = plan.annual * 12;
              return (
                <div key={plan.name} className={`wp-card ${plan.featured ? "featured" : ""}`}>
                  <div className={`wp-card-tag ${plan.featured ? "featured" : ""}`}>
                    {plan.tag}
                    {plan.featured && <span className="wp-live-dot" />}
                  </div>

                  <div className="wp-plan-name">{plan.name}</div>

                  <div className="wp-price-row">
                    <span className="wp-price-dollar">$</span>
                    <span className={`wp-price-num ${plan.featured ? "gold" : ""}`}>
                      {price}
                    </span>
                    <span className="wp-price-period">{plan.period}</span>
                  </div>

                  <div className="wp-price-sub">
                    {annual && plan.monthly > 0
                      ? `billed $${annualTotal} / year`
                      : "\u00a0"}
                  </div>

                  <p className="wp-plan-desc">{plan.desc}</p>

                  <div className="wp-features">
                    {plan.features.map((f) => (
                      <div key={f} className="wp-feat">
                        <Check className="wp-feat-icon" strokeWidth={2.5} />
                        {f}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`wp-btn ${plan.goldCta ? "gold" : ""}`}
                    onClick={() => setSelectedPlan(plan.name)}
                  >

                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
        <ComingSoonModal
            open={selectedPlan !== null}
            onOpenChange={(open) => {
                if (!open) setSelectedPlan(null);
            }}
            title={selectedPlan ? `${selectedPlan} checkout is coming soon` : "Checkout is coming soon"}
            description="We are finalizing billing, subscriptions, and invoice flows. You can continue building workflows while plan checkout is being completed."
        />
      </div>
    </>
  );
}
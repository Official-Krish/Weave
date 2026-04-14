import { motion } from "motion/react";

export function FinalCtaSection() {
  return (
    <section className="px-6 py-18 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl px-10 py-24 sm:px-20 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Ambient glow — top center */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Animated grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />

          {/* Top label */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[10px] font-bold tracking-[0.3em] uppercase mb-6 relative z-10"
            style={{ color: "rgba(245,166,35,0.75)" }}
          >
            Start Recording
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative z-10 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] max-w-3xl mx-auto"
          >
            Your best recordings{" "}
            <span
              className="relative inline-block"
              style={{
                color: "#F5A623",
              }}
            >
              start local.
            </span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="relative z-10 mt-6 text-base text-white/30 max-w-md mx-auto leading-relaxed"
          >
            No network dependency. No cloud exposure.
            Just clean, local recordings — merged and ready.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {/* Primary CTA */}
            <a
              href="/signup"
              className="group relative overflow-hidden rounded-full px-8 py-3.5 text-sm font-bold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "#F5A623",
                color: "#0c0c0e",
              }}
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                }}
              />
              <span className="relative">Start free — no card needed</span>
            </a>

            {/* Secondary CTA */}
            <a
              href="/product"
              className="rounded-full px-8 py-3.5 text-sm font-bold tracking-wide transition-all duration-200 hover:bg-white/8"
              style={{
                color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Explore the product →
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative z-10 mt-10 flex items-center justify-center gap-6"
          >
            {["No cloud required", "HLS encrypted", "Free to start"].map((item, i) => (
              <div key={item} className="flex items-center gap-4">
                <span className="text-xs text-white/20 tracking-wide">{item}</span>
                {i < 2 && (
                  <span className="w-px h-3 bg-white/10" />
                )}
              </div>
            ))}
          </motion.div>

          {/* Bottom ambient glow */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[150px] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(245,166,35,0.07) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
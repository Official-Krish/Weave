import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";

const problems = [
  {
    number: "01",
    title: "Bad internet ruins interviews.",
    copy: "A weak connection turns a great conversation into a broken deliverable. Dropped frames, choppy audio, lost takes — gone forever.",
    stat: "67%",
    statLabel: "of remote recordings have quality issues",
    fix: "Local capture means zero network dependency during recording.",
  },
  {
    number: "02",
    title: "Remote recordings drop frames.",
    copy: "Cloud-only capture smears motion, flattens audio, and loses the exact moments that matter most.",
    stat: "4×",
    statLabel: "more artifacts in stream-based recording",
    fix: "Each device records its own full-res track independently.",
  },
  {
    number: "03",
    title: "Privacy risks travel with the upload.",
    copy: "When raw media lives in transit too early, your content is exposed before you've even reviewed it.",
    stat: "0",
    statLabel: "cloud servers see your raw footage with Weave",
    fix: "HLS encryption happens on-device. Keys never leave.",
  },
];

function ProblemRow({ problem, index }: { problem: typeof problems[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative cursor-default"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Hover background sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          background: "linear-gradient(90deg, rgba(245,166,35,0.03) 0%, transparent 60%)",
          borderLeft: hovered ? "2px solid rgba(245,166,35,0.5)" : "2px solid transparent",
        }}
      />

      <div className="relative px-8 py-10 grid grid-cols-[80px_1fr_280px] gap-8 items-start lg:grid-cols-[80px_1fr_320px]">

        {/* Number */}
        <div className="relative pt-1">
          <motion.span
            className="block font-mono text-[11px] tracking-[0.3em]"
            animate={{ color: hovered ? "rgba(245,166,35,0.7)" : "rgba(255,255,255,0.2)" }}
            transition={{ duration: 0.2 }}
          >
            {problem.number}
          </motion.span>
          {/* Ghost large number */}
          <span
            className="absolute -top-2 -left-1 text-7xl font-black pointer-events-none select-none transition-opacity duration-300"
            style={{
              color: "rgba(245,166,35,0.04)",
              opacity: hovered ? 1 : 0,
              lineHeight: 1,
            }}
          >
            {problem.number}
          </span>
        </div>

        {/* Main content */}
        <div className="min-w-0">
          <h3
            className="text-xl font-bold leading-snug transition-colors duration-200"
            style={{ color: hovered ? "white" : "rgba(255,255,255,0.75)" }}
          >
            {problem.title}
          </h3>
          <p className="mt-2.5 text-sm leading-6"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            {problem.copy}
          </p>

          {/* Fix — slides in on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
            transition={{ duration: 0.25 }}
            className="mt-4 flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none"
              style={{ color: "#F5A623" }}>
              <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold"
              style={{ color: "rgba(245,166,35,0.8)" }}>
              {problem.fix}
            </span>
          </motion.div>
        </div>

        {/* Stat block — right side */}
        <div className="flex flex-col items-end justify-start pt-1">
          <motion.div
            className="text-right"
            animate={{ opacity: hovered ? 1 : 0.35 }}
            transition={{ duration: 0.2 }}
          >
            <p
              className="text-4xl font-black tracking-tight transition-colors duration-200"
              style={{ color: hovered ? "#F5A623" : "rgba(255,255,255,0.5)" }}
            >
              {problem.stat}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-right max-w-45 text-neutral-500 transition-opacity duration-200">
              {problem.statLabel}
            </p>
          </motion.div>

          {/* Fix pill — always visible */}
          <motion.div
            className="mt-4"
            animate={{
              opacity: hovered ? 0 : 1,
              y: hovered ? 4 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] uppercase"
              style={{
                background: "rgba(245,166,35,0.08)",
                border: "1px solid rgba(245,166,35,0.2)",
                color: "rgba(245,166,35,0.7)",
              }}
            >
              Weave fixes this →
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProblemSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <section id="problem" className="relative py-28 border-b border-neutral-800 overflow-hidden ">

      {/* Subtle background shader — ambient glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        {/* Top-left amber bloom */}
        <div className="absolute top-0 left-0 w-100 h-75"
          style={{
            background: "radial-gradient(ellipse at 0% 0%, rgba(245,166,35,0.04) 0%, transparent 60%)",
          }} />
        {/* Center-right subtle wash */}
        <div className="absolute top-1/3 right-0 w-125 h-100"
          style={{
            background: "radial-gradient(ellipse at 100% 30%, rgba(245,166,35,0.02) 0%, transparent 65%)",
          }} />
        {/* Bottom-left gentle glow */}
        <div className="absolute bottom-0 left-1/4 w-150 h-75"
          style={{
            background: "radial-gradient(ellipse at 20% 100%, rgba(245,166,35,0.015) 0%, transparent 70%)",
          }} />
        {/* Animated shimmer overlay — very subtle */}
        <div className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(245,166,35,0.005) 0%, transparent 50%)",
          }} />
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-8">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-4"
              style={{ color: "rgba(245,166,35,0.75)" }}>
              The Problem
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.05] max-w-lg">
              The network<br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>
                shouldn't decide
              </span>
              <br />your quality.
            </h2>
          </div>

          {/* Right side — hover hint */}
          <p className="text-xs text-neutral-500 tracking-wide self-end pb-1 hidden sm:block">
            Hover each problem to see the fix →
          </p>
        </motion.div>

        {/* Rows */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          {problems.map((p, i) => (
            <ProblemRow key={p.number} problem={p} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
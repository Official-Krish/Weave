import { motion } from "motion/react";

const WaveformBar = ({ heights }: { heights: number[] }) => (
  <div className="flex items-center gap-[2px] h-full">
    {heights.map((h, i) => (
      <div
        key={i}
        className="w-[3px] rounded-full bg-current"
        style={{ height: `${h}%`, opacity: 0.7 + (h / 100) * 0.3 }}
      />
    ))}
  </div>
);

const waveA = [30,45,60,80,55,70,40,85,65,50,75,40,60,90,55,45,70,80,35,65,50,75,85,40,60,70,45,80,55,65];
const waveB = [50,35,70,45,80,60,40,75,55,65,35,80,50,60,45,70,85,40,65,55,75,45,60,80,35,70,50,65,40,75];
const waveC = [40,65,50,75,35,80,60,45,70,55,85,40,65,50,75,35,60,80,45,70,55,40,75,60,85,45,65,50,70,35];

export function VideoEditorPreviewSection() {
  return (
    <section className="px-6 py-28 sm:px-8 border-b border-neutral-800">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#F5A623]/70 mb-4">
            Built-in Editor
          </p>
          <div className="flex items-end justify-between">
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight max-w-lg">
              Edit without<br />leaving Weave.
            </h2>
            <p className="text-sm text-white/35 max-w-xs text-right leading-relaxed hidden sm:block">
              Frame-accurate trimming, per-track audio control, and instant export — all in one place.
            </p>
          </div>
        </div>

        {/* Editor Shell */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          style={{ background: "rgba(12,12,14,0.95)" }}
        >

          {/* ── Title Bar ── */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/8"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-white/30 font-mono ml-2">
                interview_session_04 — Weave Editor
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold tracking-widest text-[#F5A623]/60 uppercase">
                1920 × 1080
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-[#F5A623] animate-pulse" />
              <span className="text-[10px] text-white/25 font-mono">ProRes 4K</span>
            </div>
          </div>

          {/* ── Main Layout ── */}
          <div className="flex" style={{ minHeight: "420px" }}>

            {/* Tool Rail */}
            <div className="flex flex-col gap-1 px-2 py-4 border-r border-white/8 w-14"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              {[
                { icon: "M6 4l12 8-12 8V4z", label: "Select", active: true },
                { icon: "M12 5v14M5 12h14", label: "Razor" },
                { icon: "M4 12h16M4 6h16M4 18h16", label: "Trim" },
                { icon: "M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z", label: "Audio" },
                { icon: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7", label: "Zoom" },
              ].map((tool, i) => (
                <button
                  key={i}
                  title={tool.label}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    tool.active
                      ? "bg-[#F5A623]/15 border border-[#F5A623]/30"
                      : "border border-transparent hover:bg-white/5"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    className={`w-4 h-4 ${tool.active ? "text-[#F5A623]" : "text-white/30"}`}>
                    <path d={tool.icon} />
                  </svg>
                </button>
              ))}
            </div>

            {/* Center: Preview + Timeline */}
            <div className="flex-1 flex flex-col">

              {/* Preview Pane */}
              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden"
                style={{ minHeight: "220px" }}>

                {/* Fake video frame — participant grid */}
                <div className="grid grid-cols-2 gap-2 w-[320px]">
                  {["Host", "Guest"].map((label, i) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden relative border border-white/10"
                      style={{ background: i === 0 ? "rgba(245,166,35,0.06)" : "rgba(255,255,255,0.04)" }}>
                      {/* Avatar circle */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <div className="w-8 h-8 rounded-full border border-white/20"
                          style={{ background: i === 0 ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.08)" }} />
                        <span className="text-[9px] text-white/30 font-medium">{label}</span>
                      </div>
                      {/* REC indicator on first */}
                      {i === 0 && (
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Animated playhead line */}
                <motion.div
                  animate={{ left: ["15%", "75%", "15%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 bottom-0 w-[1px] pointer-events-none"
                  style={{ background: "rgba(245,166,35,0.6)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#F5A623] absolute top-0 -translate-x-[3px]" />
                </motion.div>

                {/* Timecode overlay */}
                <div className="absolute bottom-3 left-4 font-mono text-xs text-white/40">
                  00:04:32:14
                </div>
                <div className="absolute bottom-3 right-4 text-[10px] text-white/25 font-medium tracking-wide">
                  PREVIEW
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t border-white/8 p-4"
                style={{ background: "rgba(255,255,255,0.02)" }}>

                {/* Timeline header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/25 uppercase">Timeline</span>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-white/20">
                    <span>00:00:00</span>
                    <span className="text-white/10">—</span>
                    <span>00:45:22</span>
                  </div>
                </div>

                {/* Track rows */}
                <div className="space-y-2">
                  {[
                    { id: "V1", label: "Video", color: "#3b82f6", wave: waveA, width: "w-full" },
                    { id: "A1", label: "Host Audio", color: "#F5A623", wave: waveB, width: "w-4/5" },
                    { id: "A2", label: "Guest Audio", color: "#22c55e", wave: waveC, width: "w-3/5" },
                  ].map((track) => (
                    <div key={track.id} className="flex items-center gap-2">
                      {/* Track label */}
                      <div className="w-8 shrink-0 text-[10px] font-bold text-white/20 text-right">
                        {track.id}
                      </div>
                      {/* Track body */}
                      <div className={`${track.width} h-9 rounded overflow-hidden relative`}
                        style={{
                          background: `rgba(${
                            track.color === "#3b82f6" ? "59,130,246" :
                            track.color === "#F5A623" ? "245,166,35" : "34,197,94"
                          },0.08)`,
                          border: `1px solid rgba(${
                            track.color === "#3b82f6" ? "59,130,246" :
                            track.color === "#F5A623" ? "245,166,35" : "34,197,94"
                          },0.2)`
                        }}>
                        <div className="absolute inset-x-3 inset-y-1 flex items-center"
                          style={{ color: track.color }}>
                          <WaveformBar heights={track.wave} />
                        </div>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium"
                          style={{ color: `${track.color}60` }}>
                          {track.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scrubber bar */}
                <div className="mt-3 relative h-1 rounded-full bg-white/5">
                  <motion.div
                    animate={{ width: ["15%", "70%", "15%"] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="h-full rounded-full bg-[#F5A623]/40"
                  />
                  <motion.div
                    animate={{ left: ["15%", "70%", "15%"] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#F5A623] border-2 border-black shadow-lg -translate-x-1/2"
                  />
                </div>
              </div>
            </div>

            {/* Right Panel — Inspector */}
            <div className="w-48 border-l border-white/8 p-4 flex flex-col gap-5 hidden lg:flex"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/20 mb-2">Clip Info</p>
                {[
                  ["Duration", "00:45:22"],
                  ["Format", "ProRes 4K"],
                  ["FPS", "29.97"],
                  ["Tracks", "3"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-baseline py-1.5 border-b border-white/5">
                    <span className="text-[10px] text-white/25">{k}</span>
                    <span className="text-[10px] font-mono font-bold text-white/60">{v}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/20 mb-2">Export</p>
                <button className="w-full py-2 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all hover:opacity-90"
                  style={{ background: "rgba(245,166,35,0.15)", color: "#F5A623", border: "1px solid rgba(245,166,35,0.25)" }}>
                  Export Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
import { motion } from "motion/react";

type StepCard = {
  title: string;
  description: string;
  illustration: "session" | "recording" | "player";
  height: "h-40" | "h-56" | "h-72";
};

const steps: StepCard[] = [
  {
    title: "Start a session",
    description: "Invite participants, open Weave, and everyone is ready to record on their device.",
    illustration: "session",
    height: "h-40",
  },
  {
    title: "Everyone records locally",
    description: "Each participant's video, audio, and screen capture locally first — weak internet becomes irrelevant.",
    illustration: "recording",
    height: "h-56",
  },
  {
    title: "Weave handles the rest",
    description: "Automatic merge, transcription, and one-click playback. Ready to share, edit, or download instantly.",
    illustration: "player",
    height: "h-72",
  },
];

function SessionSetupIllustration() {
  return (
    <svg viewBox="0 0 360 220" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="sessionScreenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="rgba(245,166,35,0.08)" />
          <stop offset="1" stopColor="rgba(245,166,35,0.02)" />
        </linearGradient>
      </defs>
      
      {/* Screen Frame */}
      <rect x="35" y="20" width="290" height="190" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(245,166,35,0.25)" strokeWidth="1.5" />
      
      {/* Header */}
      <rect x="35" y="20" width="290" height="40" rx="12" fill="rgba(255,255,255,0.03)" />
      <text x="180" y="48" textAnchor="middle" fontSize="14" fontWeight="600" fill="rgba(255,255,255,0.8)" fontFamily="system-ui">New Session</text>
      
      {/* Divider */}
      <line x1="35" y1="60" x2="325" y2="60" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      
      {/* Participant Slots */}
      <g>
        {/* Slot 1 */}
        <rect x="60" y="85" width="70" height="90" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(245,166,35,0.2)" strokeWidth="1" />
        <circle cx="95" cy="110" r="16" fill="rgba(245,166,35,0.08)" stroke="rgba(245,166,35,0.3)" strokeWidth="1.5" />
        <text x="95" y="145" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontFamily="system-ui">Participant 1</text>
        <text x="95" y="161" textAnchor="middle" fontSize="9" fill="rgba(245,166,35,0.6)" fontFamily="system-ui">Ready</text>
        
        {/* Slot 2 */}
        <rect x="145" y="85" width="70" height="90" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(245,166,35,0.2)" strokeWidth="1" />
        <circle cx="180" cy="110" r="16" fill="rgba(245,166,35,0.08)" stroke="rgba(245,166,35,0.3)" strokeWidth="1.5" />
        <text x="180" y="145" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontFamily="system-ui">Participant 2</text>
        <text x="180" y="161" textAnchor="middle" fontSize="9" fill="rgba(245,166,35,0.6)" fontFamily="system-ui">Ready</text>
        
        {/* Slot 3 */}
        <rect x="230" y="85" width="70" height="90" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(245,166,35,0.15)" strokeWidth="1" strokeDasharray="2 4" />
        <circle cx="265" cy="110" r="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="2 4" />
        <text x="265" y="145" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">+ Invite</text>
      </g>
      
      {/* Start Button */}
      <rect x="85" y="185" width="190" height="32" rx="6" fill="#F5A623" />
      <text x="180" y="207" textAnchor="middle" fontSize="13" fontWeight="600" fill="#111111" fontFamily="system-ui">Start Recording</text>
    </svg>
  );
}



function RecordingIndicatorsIllustration() {
  return (
    <svg viewBox="0 0 360 320" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <style>{`
          @keyframes pulse {
            0%, 100% { r: 5; opacity: 1; }
            50% { r: 7; opacity: 0.6; }
          }
          .rec-dot { animation: pulse 1.5s ease-in-out infinite; }
        `}</style>
      </defs>
      
      {/* Recording Container */}
      <rect x="40" y="20" width="280" height="280" rx="10" fill="rgba(255,255,255,0.01)" stroke="rgba(34,197,94,0.15)" strokeWidth="1" />
      
      {/* Header */}
      <text x="60" y="50" fontSize="12" fontWeight="600" fill="rgba(34,197,94,0.7)" fontFamily="system-ui">RECORDING IN PROGRESS</text>
      <text x="60" y="68" fontSize="11" fill="rgba(255,255,255,0.4)" fontFamily="system-ui">3 active participants</text>
      
      {/* Track 1 */}
      <g>
        <rect x="50" y="90" width="260" height="50" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" strokeWidth="1" />
        <circle cx="70" cy="115" r="5" fill="#22C55E" className="rec-dot" />
        <text x="90" y="112" fontSize="11" fill="rgba(255,255,255,0.7)" fontFamily="system-ui">Participant 1</text>
        <text x="90" y="128" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">Webcam + Audio</text>
        {/* Storage icon */}
        <rect x="285" y="105" width="20" height="18" rx="2" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth="1" />
        <text x="295" y="118" textAnchor="middle" fontSize="8" fill="rgba(34,197,94,0.6)" fontFamily="system-ui" fontWeight="600">SSD</text>
      </g>
      
      {/* Track 2 */}
      <g>
        <rect x="50" y="155" width="260" height="50" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" strokeWidth="1" />
        <circle cx="70" cy="180" r="5" fill="#22C55E" className="rec-dot" style={{ animationDelay: "0.5s" }} />
        <text x="90" y="177" fontSize="11" fill="rgba(255,255,255,0.7)" fontFamily="system-ui">Participant 2</text>
        <text x="90" y="193" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">Webcam + Screen Share</text>
        {/* Storage icon */}
        <rect x="285" y="170" width="20" height="18" rx="2" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth="1" />
        <text x="295" y="183" textAnchor="middle" fontSize="8" fill="rgba(34,197,94,0.6)" fontFamily="system-ui" fontWeight="600">SSD</text>
      </g>
      
      {/* Track 3 */}
      <g>
        <rect x="50" y="220" width="260" height="50" rx="6" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" strokeWidth="1" />
        <circle cx="70" cy="245" r="5" fill="#22C55E" className="rec-dot" style={{ animationDelay: "1s" }} />
        <text x="90" y="242" fontSize="11" fill="rgba(255,255,255,0.7)" fontFamily="system-ui">Participant 3</text>
        <text x="90" y="258" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="system-ui">Audio Only</text>
        {/* Storage icon */}
        <rect x="285" y="235" width="20" height="18" rx="2" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth="1" />
        <text x="295" y="248" textAnchor="middle" fontSize="8" fill="rgba(34,197,94,0.6)" fontFamily="system-ui" fontWeight="600">SSD</text>
      </g>
    </svg>
  );
}



function DetailedPlayerIllustration() {
  return (
    <svg viewBox="0 0 360 420" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Video Player Window */}
      <rect x="30" y="15" width="300" height="200" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(139,92,246,0.2)" strokeWidth="1.5" />
      
      {/* Title Bar */}
      <rect x="30" y="15" width="300" height="32" rx="10" fill="rgba(255,255,255,0.03)" />
      <circle cx="45" cy="31" r="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="57" cy="31" r="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="69" cy="31" r="2" fill="rgba(255,255,255,0.3)" />
      <text x="180" y="35" textAnchor="middle" fontSize="11" fontWeight="500" fill="rgba(255,255,255,0.5)" fontFamily="system-ui">meeting_edited.mp4</text>
      
      {/* Video Frame */}
      <rect x="40" y="55" width="280" height="140" rx="6" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.15)" strokeWidth="1" />
      
      {/* Playback Icon */}
      <circle cx="180" cy="125" r="18" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
      <path d="M172 117 L172 133 L190 125 Z" fill="rgba(139,92,246,0.7)" />
      
      {/* Progress Bar */}
      <rect x="40" y="205" width="280" height="2" fill="rgba(255,255,255,0.06)" rx="1" />
      <rect x="40" y="205" width="140" height="2" fill="rgba(139,92,246,0.6)" rx="1" />
      <circle cx="180" cy="206" r="3" fill="rgba(139,92,246,0.8)" />
      
      {/* Timeline Header */}
      <text x="40" y="240" fontSize="11" fontWeight="600" fill="rgba(139,92,246,0.7)" fontFamily="system-ui">MERGED TRACKS</text>
      
      {/* Track 1 - Video */}
      <g>
        <rect x="40" y="250" width="280" height="35" rx="4" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.12)" strokeWidth="1" />
        <text x="50" y="270" fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="system-ui" fontWeight="500">Video</text>
        {/* Timeline segments */}
        <rect x="100" y="255" width="60" height="8" rx="2" fill="rgba(139,92,246,0.3)" />
        <rect x="165" y="255" width="80" height="8" rx="2" fill="rgba(139,92,246,0.25)" />
        <rect x="250" y="255" width="40" height="8" rx="2" fill="rgba(139,92,246,0.2)" />
      </g>
      
      {/* Track 2 - Audio 1 */}
      <g>
        <rect x="40" y="295" width="280" height="35" rx="4" fill="rgba(34,197,94,0.04)" stroke="rgba(34,197,94,0.12)" strokeWidth="1" />
        <text x="50" y="315" fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="system-ui" fontWeight="500">Audio (P1)</text>
        {/* Waveform visualization */}
        <path d="M100 310 L102 308 L104 312 L106 306 L108 314 L110 309 L112 315 L114 310" stroke="rgba(34,197,94,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M125 310 L127 308 L129 312 L131 306 L133 314 L135 309 L137 315 L139 310" stroke="rgba(34,197,94,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M150 310 L152 308 L154 312 L156 306 L158 314 L160 309 L162 315 L164 310" stroke="rgba(34,197,94,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
      
      {/* Track 3 - Audio 2 */}
      <g>
        <rect x="40" y="340" width="280" height="35" rx="4" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.12)" strokeWidth="1" />
        <text x="50" y="360" fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="system-ui" fontWeight="500">Audio (P2)</text>
        {/* Waveform visualization */}
        <path d="M100 355 L102 353 L104 357 L106 351 L108 359 L110 354 L112 360 L114 355" stroke="rgba(168,85,247,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M125 355 L127 353 L129 357 L131 351 L133 359 L135 354 L137 360 L139 355" stroke="rgba(168,85,247,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M150 355 L152 353 L154 357 L156 351 L158 359 L160 354 L162 360 L164 355" stroke="rgba(168,85,247,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
      
      {/* Track 4 - Screen */}
      <g>
        <rect x="40" y="385" width="280" height="20" rx="4" fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
        <text x="50" y="397" fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="system-ui" fontWeight="500">Screen</text>
        <rect x="100" y="388" width="140" height="6" rx="1" fill="rgba(99,102,241,0.25)" />
      </g>
    </svg>
  );
}



function Illustration({ kind }: { kind: StepCard["illustration"] }) {
  if (kind === "session") return <SessionSetupIllustration />;
  if (kind === "recording") return <RecordingIndicatorsIllustration />;
  return <DetailedPlayerIllustration />;
}

export function HowItWorksSection() {
  return (
    <section id="howitworks" className="border-b border-neutral-800 px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-border/70 bg-background/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: "rgba(245,166,35,0.75)" }}
          >
            How it works
          </p>
          <h2 className="mt-5 font-syne text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Three simple steps to record with confidence.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Start a session. Everyone records locally. Weave handles the rest.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-end">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="group flex flex-col"
            >
              {/* Amber Numbered Label */}
              <div className="mb-4 flex items-center gap-3">
                <span className="text-4xl font-black text-[#F5A623]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="h-0.5 w-8 bg-[#F5A623]/40" />
              </div>

              {/* Illustration Area with Crescendo Height */}
              <div className={`relative mb-6 overflow-hidden rounded-lg border border-[#F5A623]/20 bg-[linear-gradient(135deg,rgba(10,10,12,0.6),rgba(18,18,22,0.4))] transition-all duration-300 group-hover:border-[#F5A623]/40 ${step.height}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.04),transparent_50%)]" />
                <div className="relative flex h-full items-center justify-center p-4">
                  <Illustration kind={step.illustration} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Bottom Border */}
              <div className="mt-5 h-px bg-[#F5A623]/15 transition-all duration-300 group-hover:bg-[#F5A623]/30" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

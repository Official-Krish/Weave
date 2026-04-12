import { motion } from "motion/react";

type Feature = {
  number: string;
  title: string;
  description: string;
  detail: string;
  icon: "recording" | "upload" | "merge" | "encryption" | "export" | "editor";
};

const features: Feature[] = [
  {
    number: "01",
    title: "Local-first recording",
    description: "Each participant is recorded at the source — weak internet never destroys quality.",
    detail: "Audio, video, and screen capture stored locally during the session.",
    icon: "recording",
  },
  {
    number: "02",
    title: "Resilient background uploads",
    description: "Chunks upload continuously with retry support so progress is never lost.",
    detail: "Automatic resumption and deduplication on connection recovery.",
    icon: "upload",
  },
  {
    number: "03",
    title: "Smart merge pipeline",
    description: "Participant tracks are stitched into a polished final recording with perfect sync.",
    detail: "Automatic audio normalization and timeline alignment across all sources.",
    icon: "merge",
  },
  {
    number: "04",
    title: "HLS privacy encryption",
    description: "All streams encrypted end-to-end with industry-standard protocols.",
    detail: "HTTPS-only delivery with automatic key rotation and audit logging.",
    icon: "encryption",
  },
  {
    number: "05",
    title: "Multi-format export",
    description: "Download recordings in MP4, WebM, MOV, or use our streaming links.",
    detail: "Adaptive bitrate transcoding optimized for each platform and device.",
    icon: "export",
  },
  {
    number: "06",
    title: "Built-in editor",
    description: "Trim, cut, and arrange segments without leaving the dashboard.",
    detail: "Non-destructive editing with frame-accurate scrubbing and preview.",
    icon: "editor",
  },
];

function RecordingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 12h2M2 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <path d="M12 5v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 9l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 16v2.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MergeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <rect x="4" y="3" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7v3M17 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="9" y="10" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function EncryptionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <path d="M12 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="7" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 13v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 7V5.5a2 2 0 0 1 4 0V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <path d="M12 2v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="5" y="16" width="14" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 19v2M15 19v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EditorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      <circle cx="18" cy="18" r="1.5" fill="currentColor" />
      <path d="M6.5 5.5l11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 19l4.5-4.5M17.5 4.5L21 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconComponent({ type }: { type: Feature["icon"] }) {
  switch (type) {
    case "recording":
      return <RecordingIcon />;
    case "upload":
      return <UploadIcon />;
    case "merge":
      return <MergeIcon />;
    case "encryption":
      return <EncryptionIcon />;
    case "export":
      return <ExportIcon />;
    case "editor":
      return <EditorIcon />;
  }
}

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-neutral-800 px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="inline-flex rounded-full border border-border/70 bg-background/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: "rgba(245,166,35,0.75)" }}
          >
            Features
          </p>
          <h2 className="mt-5 font-syne text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Everything the pipeline needs. Nothing it doesn't.
          </h2>
        </div>

        <div className="space-y-0">
          {features.map((feature, index) => (
            <motion.article
              key={feature.number}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
              className="group"
            >
              <div className="flex items-start gap-6 border-b border-neutral-800 px-4 py-4 transition-all duration-300 group-hover:translate-x-1.5 group-hover:border-l-2 group-hover:border-l-[#F5A623] group-hover:pl-3 sm:gap-8 sm:px-6">
                {/* Number */}
                <span className="text-2xl font-black text-muted-foreground/70 transition-colors duration-300 group-hover:text-[#F5A623]/60 min-w-fit">
                  {feature.number}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground sm:text-lg">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {feature.description}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/50 transition-all duration-300 opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden group-hover:mt-3.5">
                    {feature.detail}
                  </p>
                </div>

                {/* Icon */}
                <div className="shrink-0 text-muted-foreground transition-all duration-300 group-hover:text-[#F5A623] min-w-fit">
                  <IconComponent type={feature.icon} />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
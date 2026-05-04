import { motion } from "motion/react";
import { useState } from "react";
import { FaDiscord, FaGithub, FaSlack } from "react-icons/fa";
import { SiGooglecalendar } from "react-icons/si";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  features: string[];
  angle: number;
};

const integrations: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Create and manage issues directly from meeting chat",
    icon: <FaGithub />,
    color: "#a5b4fc",
    glowColor: "rgba(165,180,252,0.35)",
    features: ["Create issues", "Add comments", "Assign tasks", "Track PRs"],
    angle: 315,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send meeting updates and recording alerts to your Slack workspace",
    icon: <FaSlack />,
    color: "#fb7185",
    glowColor: "rgba(251,113,133,0.35)",
    features: ["Meeting notifications", "Recording ready alerts", "Team updates", "Instant delivery"],
    angle: 45,
  },
  {
    id: "discord",
    name: "Discord",
    description: "Share meeting summaries and recordings with your Discord server",
    icon: <FaDiscord />,
    color: "#818cf8",
    glowColor: "rgba(129,140,248,0.35)",
    features: ["Webhook notifications", "Event announcements", "Recording links", "Team coordination"],
    angle: 135,
  },
  {
    id: "google-calendar",
    name: "Calendar",
    description: "Automatically sync scheduled meetings to your calendar",
    icon: <SiGooglecalendar />,
    color: "#34d399",
    glowColor: "rgba(52,211,153,0.35)",
    features: ["Auto-schedule events", "Add attendees", "Update invites", "Recurring meetings"],
    angle: 225,
  },
];

// All spatial constants in SVG units (viewBox 0 0 400 400)
const SVG_SIZE = 400;
const CENTER = SVG_SIZE / 2; // 200
const ORBIT_R = 140;          // radius of orbit ring
const NODE_R = 28;            // radius of each integration node circle
const HUB_R = 44;             // radius of center hub circle

function getNodePos(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CENTER + ORBIT_R * Math.cos(rad),
    y: CENTER + ORBIT_R * Math.sin(rad),
  };
}

function OrbitalMap({
  activeId,
  onHover,
}: {
  activeId: string | null;
  onHover: (id: string | null) => void;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        width="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          {integrations.map((item) => (
            <filter
              key={`glow-${item.id}`}
              id={`glow-${item.id}`}
              x="-80%"
              y="-80%"
              width="260%"
              height="260%"
            >
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Outer dashed orbit ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={ORBIT_R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
          strokeDasharray="5 9"
        />
        {/* Inner ring around hub */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={HUB_R + 16}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />

        {/* ── Connection lines (drawn before nodes so nodes sit on top) ── */}
        {integrations.map((item) => {
          const { x, y } = getNodePos(item.angle);
          const isActive = activeId === item.id;

          // Unit vector from center toward node
          const dx = x - CENTER;
          const dy = y - CENTER;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / dist;
          const uy = dy / dist;

          // Start line just outside the hub circle; end just inside the node circle
          const x1 = CENTER + ux * (HUB_R + 3);
          const y1 = CENTER + uy * (HUB_R + 3);
          const x2 = x - ux * (NODE_R + 3);
          const y2 = y - uy * (NODE_R + 3);

          return (
            <line
              key={`line-${item.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? item.color : "rgba(255,255,255,0.1)"}
              strokeWidth={isActive ? 1.5 : 1}
              strokeDasharray={isActive ? undefined : "3 6"}
              style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease" }}
            />
          );
        })}

        {/* ── Center hub ── */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={HUB_R}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
        <foreignObject
          x={CENTER - HUB_R}
          y={CENTER - HUB_R}
          width={HUB_R * 2}
          height={HUB_R * 2}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.05em",
                lineHeight: 1,
              }}
            >
              weave
            </span>
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.38)",
                letterSpacing: "0.14em",
                lineHeight: 1,
              }}
            >
              CORE
            </span>
          </div>
        </foreignObject>

        {/* ── Integration nodes (everything in SVG coords) ── */}
        {integrations.map((item) => {
          const { x, y } = getNodePos(item.angle);
          const isActive = activeId === item.id;

          return (
            <g
              key={item.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => onHover(item.id)}
              onMouseLeave={() => onHover(null)}
            >
              {/* Active glow ring */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r={NODE_R + 8}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="1"
                  opacity={0.25}
                  filter={`url(#glow-${item.id})`}
                />
              )}
              {/* Node background circle */}
              <circle
                cx={x}
                cy={y}
                r={NODE_R}
                fill={isActive ? `${item.color}1a` : "rgba(255,255,255,0.04)"}
                stroke={isActive ? `${item.color}90` : "rgba(255,255,255,0.13)"}
                strokeWidth="1"
                style={{ transition: "fill 0.3s, stroke 0.3s" }}
              />
              {/* Icon — foreignObject perfectly centered on (x, y) */}
              <foreignObject
                x={x - NODE_R}
                y={y - NODE_R}
                width={NODE_R * 2}
                height={NODE_R * 2}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: isActive ? item.color : "rgba(255,255,255,0.45)",
                    transition: "color 0.3s",
                    pointerEvents: "none",
                  }}
                >
                  {item.icon}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function IntegrationsSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      className="relative overflow-hidden border-b px-6 py-28 sm:px-8"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a0b" }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: "-15%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: "-20%",
          left: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 20, height: 1, background: "rgba(245,166,35,0.6)" }} />
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.3em",
                color: "rgba(245,166,35,0.7)",
                textTransform: "uppercase",
              }}
            >
              Ecosystem
            </p>
          </div>
          <h2
            className="font-syne"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#fff",
              letterSpacing: "-0.02em",
              maxWidth: 480,
            }}
          >
            Built to fit your
            <br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>existing workflow.</span>
          </h2>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: orbital diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <OrbitalMap activeId={activeId} onHover={setActiveId} />
          </motion.div>

          {/* Right: integration list */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex flex-col gap-px"
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {integrations.map((item) => {
              const isActive = activeId === item.id;
              return (
                <motion.div
                  key={item.id}
                  className="relative flex cursor-pointer items-start gap-5 px-6 py-5"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${item.color}0d, transparent)`
                      : "rgba(255,255,255,0.02)",
                    borderLeft: isActive
                      ? `2px solid ${item.color}`
                      : "2px solid transparent",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={() => setActiveId(item.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  {/* Icon badge */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                      background: isActive ? `${item.color}18` : "rgba(255,255,255,0.05)",
                      color: isActive ? item.color : "rgba(255,255,255,0.4)",
                      border: `1px solid ${isActive ? item.color + "40" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.3s",
                    }}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                          transition: "color 0.3s",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.name}
                      </h3>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {item.features.slice(0, 2).map((f) => (
                          <span
                            key={f}
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: isActive
                                ? `${item.color}18`
                                : "rgba(255,255,255,0.05)",
                              color: isActive ? item.color : "rgba(255,255,255,0.3)",
                              border: `1px solid ${
                                isActive ? item.color + "30" : "rgba(255,255,255,0.06)"
                              }`,
                              transition: "all 0.3s",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.35)",
                        lineHeight: 1.6,
                        marginTop: 2,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-col items-center justify-between gap-4 sm:flex-row"
          style={{
            padding: "20px 28px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            More integrations arriving soon.
          </p>
          <a
            href="mailto:integrations@weave.app"
            className="group flex items-center gap-2 transition-all"
            style={{ fontSize: 13, fontWeight: 600, color: "#F5A623" }}
          >
            Request an integration
            <svg
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
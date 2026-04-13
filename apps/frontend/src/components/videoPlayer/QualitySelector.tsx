import "videojs-contrib-quality-levels";
import { useEffect, useRef, useState, useCallback } from "react";
import videojs from "video.js";
import { usePlayer } from "@videojs/react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QualityLevel {
  height: number;
  enabled: boolean;
  id: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');

  .mqs-root {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .mqs-trigger {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border-radius: 6px;
    color: rgba(255,255,255,0.85);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: background 0.18s, color 0.18s;
    user-select: none;
  }
  .mqs-trigger:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .mqs-trigger[data-open="true"] { background: rgba(255,255,255,0.1); color: #fff; }
  .mqs-trigger svg { transition: transform 0.25s cubic-bezier(.4,0,.2,1); }
  .mqs-trigger[data-open="true"] svg { transform: rotate(30deg); }

  .mqs-dropdown {
    position: absolute;
    bottom: calc(100% + 8px);
    right: 0;
    min-width: 148px;
    background: rgba(12,12,16,0.95);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    padding: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
    transform-origin: bottom right;
    animation: mqsIn 0.18s cubic-bezier(.4,0,.2,1) forwards;
    z-index: 9999;
  }
  @keyframes mqsIn {
    from { opacity: 0; transform: scale(0.93) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  .mqs-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    padding: 6px 10px 4px;
    user-select: none;
  }
  .mqs-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }

  .mqs-item {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.65);
    transition: background 0.12s, color 0.12s;
    gap: 10px;
  }
  .mqs-item:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.95); }
  .mqs-item[data-active="true"] { color: #fff; }
  .mqs-item-left { display: flex; align-items: center; gap: 8px; }

  .mqs-badge {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.06em;
    padding: 2px 5px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .mqs-badge-hd  { background: rgba(99,179,237,0.18);  color: #63b3ed; border: 1px solid rgba(99,179,237,0.25); }
  .mqs-badge-fhd { background: rgba(154,117,234,0.18); color: #b794f4; border: 1px solid rgba(154,117,234,0.25); }
  .mqs-badge-4k  { background: rgba(246,173,85,0.18);  color: #f6ad55; border: 1px solid rgba(246,173,85,0.25); }
  .mqs-badge-sd  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.1); }

  .mqs-check { opacity: 0; transition: opacity 0.15s; flex-shrink: 0; }
  .mqs-item[data-active="true"] .mqs-check { opacity: 1; }

  .mqs-auto-dot { width: 6px; height: 6px; border-radius: 50%; background: #68d391; flex-shrink: 0; }
  .mqs-item[data-active="true"] .mqs-auto-dot { animation: mqsPulse 2s infinite; }
  @keyframes mqsPulse {
    0%  { box-shadow: 0 0 0 0   rgba(104,211,145,0.5); }
    60% { box-shadow: 0 0 0 5px rgba(104,211,145,0);   }
    100%{ box-shadow: 0 0 0 0   rgba(104,211,145,0);   }
  }
`;

function injectStyles() {
  if (typeof document === "undefined" || document.getElementById("mqs-styles")) return;
  const el = document.createElement("style");
  el.id = "mqs-styles";
  el.textContent = STYLES;
  document.head.appendChild(el);
}

function getResolutionLabel(height: number) {
  if (height >= 2160) return "4K";
  if (height >= 1080) return "1080p";
  if (height >= 720)  return "720p";
  if (height >= 480)  return "480p";
  if (height >= 360)  return "360p";
  return `${height}p`;
}
function getBadgeClass(height: number) {
  if (height >= 2160) return "mqs-badge mqs-badge-4k";
  if (height >= 1080) return "mqs-badge mqs-badge-fhd";
  if (height >= 720)  return "mqs-badge mqs-badge-hd";
  return "mqs-badge mqs-badge-sd";
}
function getBadgeLabel(height: number) {
  if (height >= 2160) return "4K";
  if (height >= 1080) return "FHD";
  if (height >= 720)  return "HD";
  return "SD";
}

// ─── Component ────────────────────────────────────────────────────────────────
export function QualitySelector() {
  const [open, setOpen] = useState(false);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [selected, setSelected] = useState<number | "auto">("auto");
  const rootRef = useRef<HTMLDivElement>(null);
  const qualityLevelsRef = useRef<any>(null);
  const enableHDRef = useRef(true);

  useEffect(() => {
    const playerState = usePlayer((s) => s);
    console.log("[QualitySelector] full player state keys:", Object.keys(playerState));
    
    injectStyles();

    let retries = 0;
    const MAX_RETRIES = 30; // 3 seconds
    let timerId: ReturnType<typeof setTimeout>;

    function tryInit() {
      // Find the video element — @videojs/react doesn't forward id, so find by element
      const videoEl = (
            document.querySelector('.media-default-skin video') ??
            document.querySelector('.vjs-tech') ??
            document.querySelector('video[src*=".m3u8"]') ??
            document.querySelector('video')
        ) as HTMLVideoElement | null;

      if (!videoEl) {
        if (retries++ < MAX_RETRIES) { timerId = setTimeout(tryInit, 100); }
        return;
      }

      // Pass the ELEMENT directly — works even without an id attribute
      const vjsPlayer =
        videojs.getPlayer(videoEl as any) ??
        (videoEl as any).player ??
        (videoEl as any)._vjsPlayer;


      if (!vjsPlayer) {
        if (retries++ < MAX_RETRIES) { timerId = setTimeout(tryInit, 100); }
        return;
      }

      const qualityLevels = (vjsPlayer as any).qualityLevels?.();

      if (!qualityLevels) {
        console.warn("[QualitySelector] qualityLevels plugin not ready, retrying...");
        if (retries++ < MAX_RETRIES) { timerId = setTimeout(tryInit, 100); }
        return;
      }

      qualityLevelsRef.current = qualityLevels;

      const syncLevels = () => {
        const arr: QualityLevel[] = [];
        for (let i = 0; i < qualityLevels.length; i++) {
          arr.push({
            id: qualityLevels[i].id ?? String(i),
            height: qualityLevels[i].height,
            enabled: qualityLevels[i].enabled,
          });
        }
        arr.sort((a, b) => b.height - a.height);
        setLevels(arr);
      };

      // Wait for HLS to load quality levels — they may not exist yet at init time
      if (qualityLevels.length === 0) {
        qualityLevels.on("addqualitylevel", (event: any) => {
          // Disable quality levels with less than 720 horizontal lines when added
          const qualityLevel = event.qualityLevel;
          qualityLevel.enabled = qualityLevel.height >= 720;
          syncLevels();
        });
      } else {
        syncLevels();
        qualityLevels.on("addqualitylevel", (event: any) => {
          const qualityLevel = event.qualityLevel;
          qualityLevel.enabled = qualityLevel.height >= 720;
          syncLevels();
        });
      }

      qualityLevels.on("change", syncLevels);
    }

    tryInit();

    return () => {
      clearTimeout(timerId);
      const ql = qualityLevelsRef.current;
      if (ql) {
        ql.off("addqualitylevel");
        ql.off("change");
      }
    };
  }, []);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Toggle SD / HD (original logic preserved) ─────────────────────────────
  const _toggleQuality = useCallback(() => {
    const ql = qualityLevelsRef.current;
    if (!ql) return;
    const enable720 = enableHDRef.current;
    for (let i = 0; i < ql.length; i++) {
      ql[i].enabled = ql[i].height >= 720 ? enable720 : !enable720;
    }
    enableHDRef.current = !enable720;
  }, []);

  // ── Select a specific quality level ──────────────────────────────────────
  const setQuality = useCallback(
    (value: number | "auto") => {
      const ql = qualityLevelsRef.current;
      if (!ql) return;
      setSelected(value);
      setOpen(false);
      if (value === "auto") {
        for (let i = 0; i < ql.length; i++) ql[i].enabled = true;
      } else {
        const targetHeight = levels[value]?.height;
        for (let i = 0; i < ql.length; i++) {
          ql[i].enabled = ql[i].height === targetHeight;
        }
      }
    },
    [levels]
  );

  const triggerLabel =
    selected === "auto"
      ? "Auto"
      : levels[selected]
      ? getResolutionLabel(levels[selected].height)
      : "Auto";

  return (
    <div className="mqs-root" ref={rootRef}>
      <button
        className="mqs-trigger"
        data-open={String(open)}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Quality Settings"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
        </svg>
        {triggerLabel}
      </button>

      {open && (
        <div className="mqs-dropdown" role="listbox" aria-label="Video quality">
          <div className="mqs-section-label">Quality</div>

          <button
            className="mqs-item"
            data-active={String(selected === "auto")}
            onClick={() => setQuality("auto")}
            role="option"
            aria-selected={selected === "auto"}
          >
            <span className="mqs-item-left">
              <span className="mqs-auto-dot" />
              Auto
            </span>
            <span className="mqs-check">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#68d391" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </button>

          {levels.length > 0 && <div className="mqs-divider" />}

          {levels.map((level, i) => (
            <button
              key={level.id}
              className="mqs-item"
              data-active={String(selected === i)}
              onClick={() => setQuality(i)}
              role="option"
              aria-selected={selected === i}
            >
              <span className="mqs-item-left">
                <span className={getBadgeClass(level.height)}>{getBadgeLabel(level.height)}</span>
                {getResolutionLabel(level.height)}
              </span>
              <span className="mqs-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
            </button>
          ))}

          {levels.length === 0 && (
            <div style={{ padding: '6px 10px', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace' }}>
              Loading...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
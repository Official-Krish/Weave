/**
 * Timeline Info Bar Component
 * Shows all timeline elements (transitions, overlays, effects) in a generic bar below the timeline
 * Similar to the "timeline legend" or "element overview" in professional NLEs
 */

import { useMemo } from "react";
import type { Track, Overlay, TimelineElement } from "./types";
import { Film, Type, Blend, Sparkles, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineInfoBarProps {
  tracks: Track[];
  overlays: Overlay[];
  durationMs: number;
  currentTime: number;
  onSeek?: (timeMs: number) => void;
}

const ELEMENT_COLORS: Record<string, string> = {
  clip: "bg-[#eab308]/20 border-[#eab308]/40 text-[#facc15]",
  overlay: "bg-[#a855f7]/20 border-[#a855f7]/40 text-[#c084fc]",
  transition: "bg-[#06b6d4]/20 border-[#06b6d4]/40 text-[#22d3ee]",
  effect: "bg-[#ec4899]/20 border-[#ec4899]/40 text-[#f472b6]",
  audio: "bg-[#22c55e]/20 border-[#22c55e]/40 text-[#4ade80]",
};

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  clip: <Film className="h-2.5 w-2.5" />,
  overlay: <Type className="h-2.5 w-2.5" />,
  transition: <Blend className="h-2.5 w-2.5" />,
  effect: <Sparkles className="h-2.5 w-2.5" />,
  audio: <Volume2 className="h-2.5 w-2.5" />,
};

export function TimelineInfoBar({
  tracks,
  overlays,
  durationMs,
  currentTime,
  onSeek,
}: TimelineInfoBarProps) {
  const elements = useMemo(() => {
    const allElements: TimelineElement[] = [];

    // Extract clips from tracks
    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        // Main clip
        allElements.push({
          id: `clip-${clip.id || clip.sourceAssetId}`,
          type: track.type === "AUDIO" ? "audio" : "clip",
          name: clip.name || `Clip ${clip.sourceAssetId.slice(0, 6)}`,
          startMs: clip.timelineStartMs,
          endMs: clip.timelineStartMs + clip.durationMs,
          trackId: track.id,
          trackType: track.type,
          color: track.type === "VIDEO" ? "#eab308" : track.type === "AUDIO" ? "#22c55e" : "#a855f7",
        });

        // Transitions at clip start
        if (clip.transitionStart) {
          allElements.push({
            id: `trans-start-${clip.id || clip.sourceAssetId}`,
            type: "transition",
            name: formatTransitionName(clip.transitionStart.type),
            startMs: clip.timelineStartMs,
            endMs: clip.timelineStartMs + clip.transitionStart.durationMs,
            trackId: track.id,
            trackType: track.type,
            metadata: { transitionType: clip.transitionStart.type },
          });
        }

        // Transitions at clip end
        if (clip.transitionEnd) {
          const transStart = clip.timelineStartMs + clip.durationMs - clip.transitionEnd.durationMs;
          allElements.push({
            id: `trans-end-${clip.id || clip.sourceAssetId}`,
            type: "transition",
            name: formatTransitionName(clip.transitionEnd.type),
            startMs: transStart,
            endMs: clip.timelineStartMs + clip.durationMs,
            trackId: track.id,
            trackType: track.type,
            metadata: { transitionType: clip.transitionEnd.type },
          });
        }
      });
    });

    // Extract overlays
    overlays.forEach((overlay) => {
      allElements.push({
        id: `overlay-${overlay.id}`,
        type: "overlay",
        name: overlay.content.text.slice(0, 20) + (overlay.content.text.length > 20 ? "..." : ""),
        startMs: overlay.timelineStartMs,
        endMs: overlay.timelineStartMs + overlay.durationMs,
        trackType: "TEXT",
        metadata: {
          animation: overlay.animation?.type || "none",
          fontSize: overlay.style?.fontSize || 24,
        },
      });

      // Overlay animations
      if (overlay.animation && overlay.animation.type !== "none") {
        allElements.push({
          id: `anim-${overlay.id}`,
          type: "effect",
          name: `${overlay.animation.type} animation`,
          startMs: overlay.timelineStartMs + (overlay.animation.delayMs || 0),
          endMs: overlay.timelineStartMs + (overlay.animation.delayMs || 0) + overlay.animation.durationMs,
          trackType: "TEXT",
        });
      }
    });

    // Sort by start time
    allElements.sort((a, b) => a.startMs - b.startMs);

    return allElements;
  }, [tracks, overlays]);

  const summary = useMemo(() => {
    return {
      clips: elements.filter((e) => e.type === "clip" || e.type === "audio").length,
      overlays: elements.filter((e) => e.type === "overlay").length,
      transitions: elements.filter((e) => e.type === "transition").length,
      effects: elements.filter((e) => e.type === "effect").length,
    };
  }, [elements]);

  const currentElements = useMemo(() => {
    return elements.filter(
      (el) => currentTime >= el.startMs && currentTime <= el.endMs
    );
  }, [elements, currentTime]);

  if (durationMs === 0 || elements.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#f5a623]/10 bg-[#0a0a08]/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#f5a623]/10 px-4 py-2">
        <div className="flex items-center gap-3">
          <h4 className="text-xs font-semibold text-[#fff5de]">Timeline Overview</h4>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-[#eab308]/10 px-2 py-0.5 text-[10px] text-[#facc15]">
              <Film className="h-2.5 w-2.5" />
              {summary.clips} clips
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#06b6d4]/10 px-2 py-0.5 text-[10px] text-[#22d3ee]">
              <Blend className="h-2.5 w-2.5" />
              {summary.transitions} transitions
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#a855f7]/10 px-2 py-0.5 text-[10px] text-[#c084fc]">
              <Type className="h-2.5 w-2.5" />
              {summary.overlays} overlays
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#ec4899]/10 px-2 py-0.5 text-[10px] text-[#f472b6]">
              <Sparkles className="h-2.5 w-2.5" />
              {summary.effects} effects
            </span>
          </div>
        </div>
        {currentElements.length > 0 && (
          <div className="text-[10px] text-[#8d7850]">
            At {formatTime(currentTime)}: {currentElements.map((e) => e.name).join(", ")}
          </div>
        )}
      </div>

      {/* Element visualization bar */}
      <div
        className="relative h-12 overflow-hidden rounded-b-lg bg-[#060605]/40"
        onClick={(e) => {
          if (!onSeek || durationMs === 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          const clickTimeMs = ratio * durationMs;

          // Snapping logic (snap to boundaries within 15px)
          const snapThresholdMs = (15 / rect.width) * durationMs;
          let closestTimeMs = clickTimeMs;
          let minDiff = snapThresholdMs;

          const snapPoints = [0, durationMs];
          tracks.forEach(t => t.clips.forEach(c => {
            snapPoints.push(c.timelineStartMs);
            snapPoints.push(c.timelineStartMs + c.durationMs);
          }));
          overlays.forEach(o => {
            snapPoints.push(o.timelineStartMs);
            snapPoints.push(o.timelineStartMs + o.durationMs);
          });

          snapPoints.forEach(time => {
            const diff = Math.abs(time - clickTimeMs);
            if (diff < minDiff) {
              minDiff = diff;
              closestTimeMs = time;
            }
          });

          onSeek(Math.max(0, Math.min(closestTimeMs, durationMs)));
        }}
      >
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[#f5a623] z-20 pointer-events-none"
          style={{ left: `${(currentTime / durationMs) * 100}%` }}
        >
          <div className="absolute -top-0.5 -translate-x-1/2">
            <div className="h-0 w-0 border-l-2 border-r-2 border-t-3 border-l-transparent border-r-transparent border-t-[#f5a623]" />
          </div>
        </div>

        {/* Elements */}
        <div className="relative h-full">
          {elements.map((element) => {
            const leftPercent = (element.startMs / durationMs) * 100;
            const widthPercent = ((element.endMs - element.startMs) / durationMs) * 100;

            if (widthPercent < 0.1) return null;

            return (
              <div
                key={element.id}
                className={cn(
                  "absolute top-1 bottom-1 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-medium transition-all hover:z-10 hover:shadow-md cursor-pointer",
                  ELEMENT_COLORS[element.type] || ELEMENT_COLORS.clip
                )}
                style={{
                  left: `${leftPercent}%`,
                  width: `${Math.max(widthPercent, 0.5)}%`,
                  minWidth: widthPercent < 1 ? "4px" : undefined,
                }}
                title={`${element.name}\n${formatTime(element.startMs)} - ${formatTime(element.endMs)}`}
              >
                {widthPercent > 2 && (
                  <>
                    {ELEMENT_ICONS[element.type] || ELEMENT_ICONS.clip}
                    <span className="truncate">{element.name}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Time markers */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[9px] text-[#8d7850]">
          <span>0:00</span>
          <span>{formatTime(durationMs / 4)}</span>
          <span>{formatTime(durationMs / 2)}</span>
          <span>{formatTime((durationMs * 3) / 4)}</span>
          <span>{formatTime(durationMs)}</span>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatTransitionName(type: string): string {
  return type
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

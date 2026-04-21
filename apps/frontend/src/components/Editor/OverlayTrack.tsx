import { useEffect, useState } from "react";
import { Type, Trash2 } from "lucide-react";
import type { Overlay } from "./types";

interface OverlayTrackProps {
  overlays: Overlay[];
  durationMs: number;
  currentTime: number;
  onUpdateOverlay: (overlayId: string, updates: Partial<Overlay>) => void;
  onDeleteOverlay: (overlayId: string) => void;
}

export function OverlayTrack({
  overlays,
  durationMs,
  currentTime,
  onUpdateOverlay,
  onDeleteOverlay,
}: OverlayTrackProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dragging, setDragging] = useState<{
        overlayId: string;
        startX: number;
        startMs: number;
    } | null>(null);

    const handleMouseDown = (
        e: React.MouseEvent<HTMLDivElement>,
        overlay: Overlay,
    ) => {
        e.stopPropagation();
            setSelectedId(overlay.id!);
            setDragging({
            overlayId: overlay.id!,
            startX: e.clientX,
            startMs: overlay.timelineStartMs,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragging) return;

        const lane = e.currentTarget;
        const laneWidth = lane.getBoundingClientRect().width;
        const deltaX = e.clientX - dragging.startX;
        const deltaMs = (deltaX / laneWidth) * durationMs;

        const overlay = overlays.find(o => o.id === dragging.overlayId);
        if (!overlay) return;

        const newStart = Math.max(
            0,
            Math.min(dragging.startMs + deltaMs, durationMs - overlay.durationMs)
        );

        onUpdateOverlay(dragging.overlayId, { timelineStartMs: newStart });
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    useEffect(() => {
        if (!dragging) return;

        const handleMove = (e: MouseEvent) => {
            const lane = document.querySelector(".overlay-lane") as HTMLDivElement;
            if (!lane) return;

            const laneWidth = lane.getBoundingClientRect().width;
            const deltaX = e.clientX - dragging.startX;
            const deltaMs = (deltaX / laneWidth) * durationMs;

            const overlay = overlays.find(o => o.id === dragging.overlayId);
            if (!overlay) return;

            const newStart = Math.max(
                0,
                Math.min(dragging.startMs + deltaMs, durationMs - overlay.durationMs)
            );

            onUpdateOverlay(dragging.overlayId, {
                timelineStartMs: newStart,
            });
        };

        const handleUp = () => setDragging(null);

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [dragging, durationMs, overlays, onUpdateOverlay]);

    if (overlays.length === 0) return null;

    return (
        <div className="group">
            {/* Header */}
            <div className="mb-1.5 flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-[#f5a623]/10 bg-[#0a0a08]/60 px-2.5 py-1.5 bg-[#a855f7]/10 text-[#c084fc]">
                    <Type className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">OVERLAYS</span>
                </div>
            </div>

            {/* Lane */}
            <div
                className="overlay-lane relative h-14 overflow-hidden rounded-xl border-2 border-[#a855f7]/40 bg-[#a855f7]/10 cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Playhead */}
                {durationMs > 0 && (
                    <div
                        className="absolute top-0 bottom-0 w-px bg-[#f5a623] z-20 pointer-events-none shadow-[0_0_8px_rgba(245,166,35,0.6)]"
                        style={{ left: `${(currentTime / durationMs) * 100}%` }}
                    />
                )}

                {/* Overlay blocks */}
                {overlays.map((overlay) => {
                    const leftPercent = (overlay.timelineStartMs / durationMs) * 100;
                    const widthPercent = (overlay.durationMs / durationMs) * 100;
                    const isSelected = selectedId === overlay.id;

                    return (
                        <div
                            key={overlay.id}
                            onMouseDown={(e) => handleMouseDown(e, overlay)}
                            className={`absolute top-1.5 bottom-1.5 rounded-lg border overflow-hidden
                                transition-all duration-150 cursor-grab active:cursor-grabbing
                                group/overlay
                                ${isSelected
                                ? "bg-[#a855f7]/40 border-[#a855f7] ring-2 ring-[#a855f7]"
                                : "bg-[#a855f7]/25 border-[#a855f7]/50"
                                }
                                hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}
                            style={{
                                left: `${leftPercent}%`,
                                width: `${Math.max(widthPercent, 0.5)}%`,
                                minWidth: "4px",
                            }}
                        >
                            <div className="flex h-full items-center px-1.5 gap-1">
                                <Type className="h-3 w-3 text-[#c084fc] shrink-0" />
                                <span className="truncate text-[10px] font-medium text-[#fff5de]/90">
                                    {overlay.content.text}
                                </span>
                            </div>

                            {/* Delete button */}
                            <button
                                className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-[#ef4444]/20 p-0.5 text-[#f87171] opacity-0 transition-all group-hover/overlay:opacity-100 hover:bg-[#ef4444]/40"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                e.stopPropagation();
                                onDeleteOverlay(overlay.id!);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
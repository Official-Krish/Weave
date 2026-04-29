import { useRef } from "react";
import type { Overlay } from "./types";
import { X, Check } from "lucide-react";

interface OverlayLayerProps {
  overlays: Overlay[];
  timelineTime: number;
  containerSize: { width: number; height: number };
  stageWidth: number;
  stageHeight: number;
  selectedOverlayId: string | null;
  setSelectedOverlayId: (id: string | null) => void;
  editingOverlayId: string | null;
  setEditingOverlayId: (id: string | null) => void;
  editText: string;
  setEditText: (text: string) => void;
  handleUpdateOverlay: (id: string, updates: Partial<Overlay>) => void;
  handleDeleteOverlay: (id: string) => void;
  handleStartTextEdit: (overlay: Overlay) => void;
  handleCommitTextEdit: () => void;
}

export function OverlayLayer({
  overlays,
  timelineTime,
  containerSize,
  stageWidth,
  stageHeight,
  selectedOverlayId,
  setSelectedOverlayId,
  editingOverlayId,
  setEditingOverlayId,
  editText,
  setEditText,
  handleUpdateOverlay,
  handleDeleteOverlay,
  handleStartTextEdit,
  handleCommitTextEdit,
}: OverlayLayerProps) {
  const overlayEditContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={overlayEditContainerRef} className="absolute inset-0 pointer-events-none z-30">
      {/* Overlay position indicators (visible overlays as draggable chips) */}
      {overlays
        .filter(
          (o) =>
            timelineTime >= o.timelineStartMs &&
            timelineTime <= o.timelineStartMs + o.durationMs
        )
        .map((overlay) => {
          if (!overlay.id) return null;
          const scaleX = containerSize.width / stageWidth;
          const scaleY = containerSize.height / stageHeight;
          const isSelected = selectedOverlayId === overlay.id;

          return (
            <div
              key={overlay.id}
              className={`absolute pointer-events-auto cursor-move select-none transition-all duration-100
                ${isSelected
                  ? "ring-2 ring-[#f5a623] ring-offset-1 ring-offset-transparent rounded"
                  : "hover:ring-1 hover:ring-[#f5a623]/40 rounded"
                }`}
              style={{
                left: overlay.transform.x * scaleX,
                top: overlay.transform.y * scaleY,
                fontSize: (overlay.style?.fontSize || 24) * scaleX,
                fontFamily: overlay.style?.fontFamily || "Inter, system-ui, sans-serif",
                fontWeight: overlay.style?.fontWeight || "normal",
                fontStyle: overlay.style?.fontStyle || "normal",
                color: "transparent", // Text rendered on canvas; this is just a hit area
                minWidth: 40 * scaleX,
                minHeight: 20 * scaleY,
                padding: "2px 4px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOverlayId(overlay.id!);
              }}
              onDoubleClick={() => handleStartTextEdit(overlay)}
              onMouseDown={(e) => {
                if (editingOverlayId) return;
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const origX = overlay.transform.x;
                const origY = overlay.transform.y;

                const handleMove = (moveE: MouseEvent) => {
                  const dx = (moveE.clientX - startX) / scaleX;
                  const dy = (moveE.clientY - startY) / scaleY;
                  handleUpdateOverlay(overlay.id!, {
                    transform: {
                      ...overlay.transform,
                      x: Math.max(0, origX + dx),
                      y: Math.max(0, origY + dy),
                    },
                  });
                };

                const handleUp = () => {
                  window.removeEventListener("mousemove", handleMove);
                  window.removeEventListener("mouseup", handleUp);
                };

                window.addEventListener("mousemove", handleMove);
                window.addEventListener("mouseup", handleUp);
              }}
            >
              {/* Invisible text for sizing the hit area */}
              <span style={{ visibility: "hidden", whiteSpace: "pre" }}>
                {overlay.content.text}
              </span>
            </div>
          );
        })}

      {/* Inline text editing input */}
      {editingOverlayId && (() => {
        const overlay = overlays.find(o => o.id === editingOverlayId);
        if (!overlay) return null;

        const scaleX = containerSize.width / stageWidth;
        const scaleY = containerSize.height / stageHeight;

        return (
          <>
            <div
              className="fixed inset-0 z-50 pointer-events-auto"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCommitTextEdit();
              }}
            />
            <input
              autoFocus
              className="pointer-events-auto"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={handleCommitTextEdit}
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === "Enter") handleCommitTextEdit();
                if (e.key === "Escape") setEditingOverlayId(null);
              }}
              style={{
                position: "absolute",
                left: overlay.transform.x * scaleX,
                top: overlay.transform.y * scaleY,
                fontSize: (overlay.style?.fontSize || 24) * scaleX,
                fontFamily: overlay.style?.fontFamily || "Inter, system-ui, sans-serif",
                color: overlay.style?.color || "#ffffff",
                background: "rgba(0,0,0,0.7)",
                border: "2px solid #f5a623",
                borderRadius: 6,
                padding: "4px 8px",
                outline: "none",
                minWidth: 100,
                zIndex: 60,
                backdropFilter: "blur(8px)",
              }}
            />
          </>
        );
      })()}

      {/* Selected overlay style toolbar */}
      {selectedOverlayId && !editingOverlayId && (() => {
        const overlay = overlays.find(o => o.id === selectedOverlayId);
        if (!overlay) return null;
        const scaleX = containerSize.width / stageWidth;
        const scaleY = containerSize.height / stageHeight;
        const toolbarLeft = overlay.transform.x * scaleX;
        const toolbarTop = Math.max(8, overlay.transform.y * scaleY - 48);

        return (
          <div
            className="absolute z-50 pointer-events-auto flex items-center gap-2 rounded-lg border border-[#f5a623]/30 bg-black/80 px-3 py-1.5 text-xs text-[#fff5de] shadow-xl backdrop-blur-md"
            style={{
              left: Math.min(toolbarLeft, containerSize.width - 300),
              top: toolbarTop,
            }}
          >
            <button
              className={`rounded px-2 py-0.5 font-bold transition-colors ${overlay.style?.fontWeight === "bold" ? "bg-[#f5a623]/30 text-[#f5a623]" : "bg-[#f5a623]/10 hover:bg-[#f5a623]/20"}`}
              onClick={() =>
                handleUpdateOverlay(overlay.id!, {
                  style: {
                    ...overlay.style,
                    fontWeight: overlay.style?.fontWeight === "bold" ? "normal" : "bold",
                  },
                })
              }
            >
              B
            </button>
            <button
              className={`rounded px-2 py-0.5 italic transition-colors ${overlay.style?.fontStyle === "italic" ? "bg-[#f5a623]/30 text-[#f5a623]" : "bg-[#f5a623]/10 hover:bg-[#f5a623]/20"}`}
              onClick={() =>
                handleUpdateOverlay(overlay.id!, {
                  style: {
                    ...overlay.style,
                    fontStyle: overlay.style?.fontStyle === "italic" ? "normal" : "italic",
                  },
                })
              }
            >
              I
            </button>
            <div className="h-4 w-px bg-[#f5a623]/20" />
            <input
              type="color"
              value={overlay.style?.color || "#ffffff"}
              onChange={(e) =>
                handleUpdateOverlay(overlay.id!, {
                  style: { ...overlay.style, color: e.target.value },
                })
              }
              className="h-6 w-7 rounded border border-[#f5a623]/20 bg-transparent p-0 cursor-pointer"
              title="Text color"
            />
            <div className="h-4 w-px bg-[#f5a623]/20" />
            <input
              type="range"
              min={12}
              max={96}
              value={overlay.style?.fontSize || 24}
              onChange={(e) =>
                handleUpdateOverlay(overlay.id!, {
                  style: { ...overlay.style, fontSize: Number(e.target.value) },
                })
              }
              className="w-20 accent-[#f5a623]"
              title="Font size"
            />
            <span className="text-[10px] text-[#8d7850] w-6 text-center">{overlay.style?.fontSize || 24}</span>
            <div className="h-4 w-px bg-[#f5a623]/20" />
            <select
              value={overlay.style?.textAlign || "left"}
              onChange={(e) =>
                handleUpdateOverlay(overlay.id!, {
                  style: {
                    ...overlay.style,
                    textAlign: e.target.value as "left" | "center" | "right",
                  },
                })
              }
              className="rounded border border-[#f5a623]/20 bg-black/60 px-1.5 py-0.5 text-[11px] cursor-pointer"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
            <div className="h-4 w-px bg-[#f5a623]/20" />
            <button
              className="rounded px-1.5 py-0.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
              onClick={() => setSelectedOverlayId(null)}
              title="Deselect overlay"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              className="rounded px-1.5 py-0.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              onClick={() => handleDeleteOverlay(overlay.id!)}
              title="Delete overlay"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })()}
    </div>
  );
}

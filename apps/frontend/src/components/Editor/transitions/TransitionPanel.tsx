/**
 * Transition Panel Component
 * Professional transition selector similar to Premiere Pro Effects panel
 */

import { useState, useMemo } from "react";
import {
  type TransitionCategory,
  type TransitionType,
  getTransitionsByCategory,
} from "./types";
import { cn } from "@/lib/utils";

interface TransitionPanelProps {
  onSelectTransition: (type: TransitionType) => void;
  selectedTransition?: TransitionType | null;
  onClose?: () => void;
}

const CATEGORIES: { id: TransitionCategory; label: string; icon: string }[] = [
  { id: "basic", label: "Basic", icon: "◫" },
  { id: "slide", label: "Slide", icon: "⇄" },
  { id: "wipe", label: "Wipe", icon: "⬚" },
  { id: "special", label: "Special", icon: "✦" },
];

export function TransitionPanel({
  onSelectTransition,
  selectedTransition,
  onClose,
}: TransitionPanelProps) {
  const [activeCategory, setActiveCategory] = useState<TransitionCategory>("basic");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransitions = useMemo(() => {
    const transitions = getTransitionsByCategory(activeCategory);
    if (!searchQuery.trim()) return transitions;
    return transitions.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex h-full flex-col bg-[#0a0a08]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#f5a623]/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-[#fff5de]">Transitions</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-[#8d7850] transition-colors hover:bg-[#f5a623]/10 hover:text-[#f5a623]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="border-b border-[#f5a623]/10 px-4 py-2">
        <input
          type="text"
          placeholder="Search transitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-[#f5a623]/20 bg-[#1a1a16] px-3 py-1.5 text-xs text-[#fff5de] placeholder-[#8d7850] outline-none focus:border-[#f5a623]/40"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-[#f5a623]/10 px-2 pt-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
              activeCategory === cat.id
                ? "text-[#f5a623] border-b-2 border-[#f5a623]"
                : "text-[#8d7850] hover:text-[#bfa873]"
            )}
          >
            <span className="text-[10px]">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Transition Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {filteredTransitions.map((transition) => {
            const isSelected = selectedTransition === transition.type;
            return (
              <button
                key={transition.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/json", JSON.stringify({ type: "transition", transitionType: transition.type }));
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => onSelectTransition(transition.type)}
                className={cn(
                  "group relative flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-200 cursor-grab active:cursor-grabbing",
                  isSelected
                    ? "border-[#f5a623] bg-[#f5a623]/10 shadow-[0_0_12px_rgba(245,166,35,0.3)]"
                    : "border-[#f5a623]/10 bg-[#1a1a16]/50 hover:border-[#f5a623]/30 hover:bg-[#1a1a16]"
                )}
              >
                {/* Preview Icon */}
                <div
                  className={cn(
                    "mb-2 flex h-8 w-8 items-center justify-center rounded transition-colors",
                    isSelected ? "text-[#f5a623]" : "text-[#8d7850] group-hover:text-[#bfa873]"
                  )}
                >
                  <TransitionIcon type={transition.type} />
                </div>

                {/* Name */}
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isSelected ? "text-[#f5a623]" : "text-[#8d7850] group-hover:text-[#bfa873]"
                  )}
                >
                  {transition.name}
                </span>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f5a623]" />
                )}
              </button>
            );
          })}
        </div>

        {filteredTransitions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 text-2xl text-[#8d7850]">⊘</div>
            <p className="text-xs text-[#8d7850]">No transitions found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#f5a623]/10 px-4 py-2">
        <p className="text-[10px] text-[#8d7850]">
          Click to select • Drag to timeline edge to apply
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Transition Icons
// ──────────────────────────────────────────────────────────────────────────

function TransitionIcon({ type }: { type: TransitionType }) {
  switch (type) {
    // Basic
    case "cut":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4v16M4 12h16" strokeWidth="2"/></svg>;
    case "fade":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.5"/></svg>;
    case "cross-dissolve":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" strokeWidth="2"/><rect x="3" y="3" width="18" height="18" strokeWidth="2" opacity="0.5" transform="translate(4,4)"/></svg>;
    case "dip-to-black":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="7" height="16"/><rect x="13" y="4" width="7" height="16" opacity="0.3"/></svg>;

    // Slide
    case "slide-left":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4l-8 8 8 8" strokeWidth="2"/><rect x="4" y="4" width="8" height="16" fill="currentColor" opacity="0.3"/></svg>;
    case "slide-right":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 4l8 8-8 8" strokeWidth="2"/><rect x="12" y="4" width="8" height="16" fill="currentColor" opacity="0.3"/></svg>;
    case "slide-up":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 16l8-8 8 8" strokeWidth="2"/><rect x="4" y="12" width="16" height="8" fill="currentColor" opacity="0.3"/></svg>;
    case "slide-down":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 8l8 8 8-8" strokeWidth="2"/><rect x="4" y="4" width="16" height="8" fill="currentColor" opacity="0.3"/></svg>;

    // Push
    case "push-left":
    case "push-right":
    case "push-up":
    case "push-down":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="8" height="18" fill="currentColor" opacity="0.3"/><rect x="13" y="3" width="8" height="18" fill="currentColor" opacity="0.6"/><path d="M11 12h2" strokeWidth="2"/></svg>;

    // Wipe
    case "wipe-left":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 4v16M6 4v16" strokeWidth="2"/><rect x="6" y="4" width="12" height="16" fill="currentColor" opacity="0.3"/></svg>;
    case "wipe-right":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 4v16M18 4v16" strokeWidth="2"/><rect x="6" y="4" width="12" height="16" fill="currentColor" opacity="0.3"/></svg>;
    case "wipe-top":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 18h16M4 6h16" strokeWidth="2"/><rect x="4" y="6" width="16" height="12" fill="currentColor" opacity="0.3"/></svg>;
    case "wipe-bottom":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 18h16" strokeWidth="2"/><rect x="4" y="6" width="16" height="12" fill="currentColor" opacity="0.3"/></svg>;
    case "wipe-clock":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="2"/><path d="M12 12l4-4" strokeWidth="2"/><path d="M12 4v8" strokeWidth="2" opacity="0.5"/></svg>;
    case "wipe-radial":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="2"/><path d="M12 12A8 8 0 0 1 12 4" strokeWidth="2"/><path d="M12 12L18 18" strokeWidth="2" opacity="0.5"/></svg>;

    // Shape wipes
    case "circle-open":
    case "circle-close":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="2"/><circle cx="12" cy="12" r="4" strokeWidth="2" opacity="0.5"/></svg>;
    case "diamond-open":
    case "diamond-close":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l8 8-8 8-8-8z" strokeWidth="2"/><path d="M12 6l4 4-4 4-4-4z" strokeWidth="2" opacity="0.5"/></svg>;
    case "square-open":
    case "square-close":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="4" width="16" height="16" strokeWidth="2"/><rect x="8" y="8" width="8" height="8" strokeWidth="2" opacity="0.5"/></svg>;

    // Special
    case "blur":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="2" strokeDasharray="2 2"/><circle cx="12" cy="12" r="4" strokeWidth="2" strokeDasharray="2 2"/></svg>;
    case "zoom-in":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="2"/><path d="M12 8v8M8 12h8" strokeWidth="2"/></svg>;
    case "zoom-out":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="8" strokeWidth="2"/><path d="M8 12h8" strokeWidth="2"/></svg>;
    case "swap":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 7h10v10" strokeWidth="2"/><path d="M17 17H7V7" strokeWidth="2"/><path d="M7 17l10-10" strokeWidth="2"/></svg>;
    case "cube-left":
    case "cube-right":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l8 4v12l-8 4-8-4V6z" strokeWidth="2"/><path d="M12 2v12l8-4M12 14l-8-4" strokeWidth="2"/></svg>;
    case "page-turn":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h12l4 4v12H4z" strokeWidth="2"/><path d="M16 4v4h4" strokeWidth="2"/><path d="M16 8l-4 4" strokeWidth="2" opacity="0.5"/></svg>;

    // Gradient
    case "gradient-left":
    case "gradient-right":
    case "gradient-top":
    case "gradient-bottom":
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" fill="url(#grad)" strokeWidth="2"/><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/><stop offset="100%" stopColor="currentColor" stopOpacity="1"/></linearGradient></defs></svg>;

    default:
      return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="4" width="16" height="16" strokeWidth="2"/></svg>;
  }
}

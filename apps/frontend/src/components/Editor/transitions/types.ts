/**
 * Transition types for professional video editing
 * Similar to Premiere Pro / DaVinci Resolve transitions
 */

export type TransitionCategory = "basic" | "slide" | "wipe" | "special" | "custom";

export type TransitionEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

export type TransitionDirection =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export type TransitionShape = "circle" | "square" | "diamond" | "star";

/**
 * Base transition interface
 */
export interface Transition {
  id: string;
  type: TransitionType;
  category: TransitionCategory;
  name: string;
  durationMs: number;
  position: "start" | "end" | "between";
  // For "between" transitions, this links two clips
  sourceClipId?: string;
  targetClipId?: string;
  easing: TransitionEasing;
  direction?: TransitionDirection;
  shape?: TransitionShape;
  // Custom parameters for specific transitions
  params?: Record<string, number | string | boolean>;
  // Border/gap options for slide transitions
  borderColor?: string;
  borderWidth?: number;
  reverse?: boolean;
}

/**
 * All available transition types
 */
export type TransitionType =
  // Basic transitions
  | "cut"           // Instant change (no transition)
  | "fade"          // Fade to/from black
  | "cross-dissolve" // Smooth blend between clips
  | "dip-to-black"  // Brief fade to black between clips

  // Slide transitions
  | "slide-left"    // New clip slides in from left
  | "slide-right"   // New clip slides in from right
  | "slide-up"      // New clip slides in from top
  | "slide-down"    // New clip slides in from bottom

  // Push transitions (old clip pushes out)
  | "push-left"
  | "push-right"
  | "push-up"
  | "push-down"

  // Wipe transitions
  | "wipe-left"     // Line wipes across from left
  | "wipe-right"
  | "wipe-top"
  | "wipe-bottom"
  | "wipe-clock"    // Clock hand wipe
  | "wipe-radial"   // Radial wipe from center

  // Shape wipes
  | "circle-open"   // Circle expands from center
  | "circle-close"  // Circle closes to center
  | "diamond-open"
  | "diamond-close"
  | "square-open"
  | "square-close"

  // Special transitions
  | "blur"          // Blur transition
  | "zoom-in"       // Zoom into new clip
  | "zoom-out"      // Zoom out from old clip
  | "swap"          // 3D swap effect
  | "cube-left"     // 3D cube rotation
  | "cube-right"
  | "page-turn"     // Page curl effect
  | "morph"         // Advanced morph (placeholder)

  // Gradient wipes
  | "gradient-left"
  | "gradient-right"
  | "gradient-top"
  | "gradient-bottom";

/**
 * Predefined transition definitions
 */
export const TRANSITION_DEFINITIONS: Omit<Transition, "id" | "durationMs" | "position">[] = [
  // Basic
  { type: "cut", category: "basic", name: "Cut", easing: "linear" },
  { type: "fade", category: "basic", name: "Fade", easing: "ease-in-out" },
  { type: "cross-dissolve", category: "basic", name: "Cross Dissolve", easing: "ease-in-out" },
  { type: "dip-to-black", category: "basic", name: "Dip to Black", easing: "ease-in-out" },

  // Slide
  { type: "slide-left", category: "slide", name: "Slide Left", easing: "ease-out", direction: "left" },
  { type: "slide-right", category: "slide", name: "Slide Right", easing: "ease-out", direction: "right" },
  { type: "slide-up", category: "slide", name: "Slide Up", easing: "ease-out", direction: "top" },
  { type: "slide-down", category: "slide", name: "Slide Down", easing: "ease-out", direction: "bottom" },

  // Push
  { type: "push-left", category: "slide", name: "Push Left", easing: "ease-in-out", direction: "left" },
  { type: "push-right", category: "slide", name: "Push Right", easing: "ease-in-out", direction: "right" },
  { type: "push-up", category: "slide", name: "Push Up", easing: "ease-in-out", direction: "top" },
  { type: "push-down", category: "slide", name: "Push Down", easing: "ease-in-out", direction: "bottom" },

  // Wipe
  { type: "wipe-left", category: "wipe", name: "Wipe Left", easing: "linear", direction: "left" },
  { type: "wipe-right", category: "wipe", name: "Wipe Right", easing: "linear", direction: "right" },
  { type: "wipe-top", category: "wipe", name: "Wipe Top", easing: "linear", direction: "top" },
  { type: "wipe-bottom", category: "wipe", name: "Wipe Bottom", easing: "linear", direction: "bottom" },
  { type: "wipe-clock", category: "wipe", name: "Clock Wipe", easing: "linear" },
  { type: "wipe-radial", category: "wipe", name: "Radial Wipe", easing: "linear" },

  // Shape
  { type: "circle-open", category: "wipe", name: "Circle Open", easing: "ease-out", shape: "circle" },
  { type: "circle-close", category: "wipe", name: "Circle Close", easing: "ease-in", shape: "circle" },
  { type: "diamond-open", category: "wipe", name: "Diamond Open", easing: "ease-out", shape: "diamond" },
  { type: "diamond-close", category: "wipe", name: "Diamond Close", easing: "ease-in", shape: "diamond" },
  { type: "square-open", category: "wipe", name: "Square Open", easing: "ease-out", shape: "square" },
  { type: "square-close", category: "wipe", name: "Square Close", easing: "ease-in", shape: "square" },

  // Special
  { type: "blur", category: "special", name: "Blur", easing: "ease-in-out" },
  { type: "zoom-in", category: "special", name: "Zoom In", easing: "ease-out" },
  { type: "zoom-out", category: "special", name: "Zoom Out", easing: "ease-in" },
  { type: "swap", category: "special", name: "Swap", easing: "ease-in-out" },
  { type: "cube-left", category: "special", name: "Cube Left", easing: "ease-out", direction: "left" },
  { type: "cube-right", category: "special", name: "Cube Right", easing: "ease-out", direction: "right" },
  { type: "page-turn", category: "special", name: "Page Turn", easing: "ease-in-out", direction: "right" },

  // Gradient
  { type: "gradient-left", category: "special", name: "Gradient Left", easing: "ease-out", direction: "left" },
  { type: "gradient-right", category: "special", name: "Gradient Right", easing: "ease-out", direction: "right" },
  { type: "gradient-top", category: "special", name: "Gradient Top", easing: "ease-out", direction: "top" },
  { type: "gradient-bottom", category: "special", name: "Gradient Bottom", easing: "ease-out", direction: "bottom" },
];

/**
 * Get transition by type
 */
export function getTransitionDefinition(type: TransitionType): typeof TRANSITION_DEFINITIONS[0] | undefined {
  return TRANSITION_DEFINITIONS.find(t => t.type === type);
}

/**
 * Get transitions by category
 */
export function getTransitionsByCategory(category: TransitionCategory): typeof TRANSITION_DEFINITIONS {
  return TRANSITION_DEFINITIONS.filter(t => t.category === category);
}

/**
 * Default transition duration in ms
 */
export const DEFAULT_TRANSITION_DURATION = 500;

/**
 * Minimum transition duration in ms
 */
export const MIN_TRANSITION_DURATION = 100;

/**
 * Maximum transition duration in ms
 */
export const MAX_TRANSITION_DURATION = 3000;

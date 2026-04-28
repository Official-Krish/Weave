import type { Overlay } from "../../types";

export interface RenderState {
  stretchX: number;
  stretchY: number;
  offsetX: number;
  offsetY: number;
  trimStart: number; // seconds
  trimEnd: number; // seconds
}

export interface RenderOverlay {
  overlay: Overlay;
  timelineTimeMs: number;
}

/**
 * Starts a requestAnimationFrame render loop that draws the video onto
 * the canvas with transform state applied, plus composites text overlays.
 *
 * Returns a `stop()` function to cancel the loop.
 */
export function startRenderLoop(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  getState: () => RenderState,
  getOverlays?: () => RenderOverlay[],
  onFrame?: (videoTimeMs: number) => void
): () => void {
  let animId = 0;
  let running = true;

  function render() {
    if (!running) return;

    const {
      stretchX,
      stretchY,
      offsetX,
      offsetY,
      trimStart,
      trimEnd,
    } = getState();

    // Trim enforcement
    if (trimStart > 0 && video.currentTime < trimStart) {
      video.currentTime = trimStart;
    }
    if (trimEnd > 0 && video.currentTime > trimEnd) {
      video.pause();
    }

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video with transforms
    ctx.save();
    const drawW = canvas.width * stretchX;
    const drawH = canvas.height * stretchY;
    const drawX = (canvas.width - drawW) / 2 + offsetX;
    const drawY = (canvas.height - drawH) / 2 + offsetY;

    ctx.drawImage(video, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Draw overlays
    if (getOverlays) {
      const items = getOverlays();
      for (const item of items) {
        drawTextOverlay(ctx, item.overlay, canvas.width, canvas.height);
      }
    }

    // Report frame time
    onFrame?.(video.currentTime * 1000);

    animId = requestAnimationFrame(render);
  }

  render();

  return () => {
    running = false;
    cancelAnimationFrame(animId);
  };
}

/**
 * Draw a single frame on the canvas (used for seek/pause states).
 */
export function drawSingleFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  state: RenderState,
  overlays?: RenderOverlay[]
) {
  const { stretchX, stretchY, offsetX, offsetY } = state;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  const drawW = canvas.width * stretchX;
  const drawH = canvas.height * stretchY;
  const drawX = (canvas.width - drawW) / 2 + offsetX;
  const drawY = (canvas.height - drawH) / 2 + offsetY;
  ctx.drawImage(video, drawX, drawY, drawW, drawH);
  ctx.restore();

  if (overlays) {
    for (const item of overlays) {
      drawTextOverlay(ctx, item.overlay, canvas.width, canvas.height);
    }
  }
}

/**
 * Render a text overlay onto the canvas using the 2D context.
 */
function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: Overlay,
  _canvasW: number,
  _canvasH: number
) {
  const { content, transform, style } = overlay;
  const text = content.text;
  if (!text) return;

  const fontSize = style?.fontSize || 24;
  const fontFamily = style?.fontFamily || "Inter, system-ui, sans-serif";
  const fontWeight = style?.fontWeight === "bold" ? "bold" : "normal";
  const fontStyle = style?.fontStyle === "italic" ? "italic" : "normal";
  const color = style?.color || "#ffffff";
  const textAlign = style?.textAlign || "left";

  ctx.save();
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign as CanvasTextAlign;
  ctx.textBaseline = "top";

  // Background
  if (style?.backgroundColor) {
    const bgOpacity = style.backgroundOpacity ?? 0.5;
    const metrics = ctx.measureText(text);
    const bgX = transform.x - 4;
    const bgY = transform.y - 2;
    const bgW = metrics.width + 8;
    const bgH = fontSize + 4;

    ctx.save();
    ctx.globalAlpha = bgOpacity;
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(bgX, bgY, bgW, bgH);
    ctx.restore();
    ctx.fillStyle = color;
  }

  // Text shadow
  if (style?.textShadow) {
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  }

  // Letter spacing
  if (style?.letterSpacing && style.letterSpacing !== 0) {
    let x = transform.x;
    for (const char of text) {
      ctx.fillText(char, x, transform.y);
      x += ctx.measureText(char).width + (style.letterSpacing || 0);
    }
  } else {
    ctx.fillText(text, transform.x, transform.y);
  }

  ctx.restore();
}

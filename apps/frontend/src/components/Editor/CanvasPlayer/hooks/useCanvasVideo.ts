import { useEffect, useRef, useState, useCallback } from "react";
import { startRenderLoop, drawSingleFrame } from "../utils/RenderLoop";
import type { RenderState, RenderOverlay } from "../utils/RenderLoop";
import type { Overlay } from "../../types";

export interface UseCanvasVideoOptions {
  currentTime?: number; // ms — seek target from editor
  isPlaying?: boolean;
  onTimeUpdate?: (timeMs: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  overlays?: Overlay[];
  timelineTimeMs?: number;
}

export function useCanvasVideo(src: string, options: UseCanvasVideoOptions = {}) {
  const {
    currentTime,
    isPlaying,
    onTimeUpdate,
    onPlayStateChange,
    overlays = [],
    timelineTimeMs = 0,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopLoopRef = useRef<(() => void) | null>(null);
  const isSeekingInternalRef = useRef(false);
  const prevSrcRef = useRef<string>("");

  // Transform state
  const [stretchX, setStretchX] = useState(1);
  const [stretchY, setStretchY] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Trim
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Internal state
  const [duration, setDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep refs for state getters (avoids stale closures in render loop)
  const transformRef = useRef<RenderState>({
    stretchX: 1,
    stretchY: 1,
    offsetX: 0,
    offsetY: 0,
    trimStart: 0,
    trimEnd: 0,
  });

  const overlaysRef = useRef<Overlay[]>([]);
  const timelineTimeMsRef = useRef(0);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlayStateChangeRef = useRef(onPlayStateChange);

  // Update refs synchronously during render (no effects needed for refs)
  transformRef.current = { stretchX, stretchY, offsetX, offsetY, trimStart, trimEnd };
  overlaysRef.current = overlays;
  timelineTimeMsRef.current = timelineTimeMs;
  onTimeUpdateRef.current = onTimeUpdate;
  onPlayStateChangeRef.current = onPlayStateChange;

  // ─── Helpers ──────────────────────────────────────────────────────
  const getVisibleOverlays = useCallback((): RenderOverlay[] => {
    const tMs = timelineTimeMsRef.current;
    return overlaysRef.current
      .filter(
        (o) =>
          tMs >= o.timelineStartMs &&
          tMs <= o.timelineStartMs + o.durationMs
      )
      .map((overlay) => ({ overlay, timelineTimeMs: tMs }));
  }, []);

  const startLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Stop any previous loop
    stopLoopRef.current?.();

    const stop = startRenderLoop(
      ctx,
      video,
      canvas,
      () => transformRef.current,
      () => getVisibleOverlays(),
      (videoTimeMs) => {
        setVideoCurrentTime(videoTimeMs / 1000);
        onTimeUpdateRef.current?.(videoTimeMs);
      }
    );

    stopLoopRef.current = stop;
  }, [getVisibleOverlays]);

  const drawCurrentFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const activeOverlays = getVisibleOverlays();
    drawSingleFrame(ctx, video, canvas, transformRef.current, activeOverlays);
  }, [getVisibleOverlays]);

  // ─── Source switching + Event listeners (merged to avoid mount-order issues) ───
  // This effect re-runs whenever `src` changes. It sets the video source,
  // attaches all event listeners, and cleans up on unmount or src change.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Stop any existing render loop
    stopLoopRef.current?.();
    stopLoopRef.current = null;

    // If src is empty, just reset state
    if (!src) {
      setIsLoaded(false);
      return;
    }

    setIsLoaded(false);

    // ─── Event handlers ─────────────────────────────────────────
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoaded(true);
      // Draw first frame
      const canvas = canvasRef.current;
      if (canvas) {
        // Ensure canvas has dimensions
        if (canvas.width === 0 || canvas.height === 0) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = 1280 * dpr;
          canvas.height = 720 * dpr;
          canvas.style.width = "1280px";
          canvas.style.height = "720px";
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          drawSingleFrame(ctx, video, canvas, transformRef.current);
        }
      }
    };

    const handleCanPlay = () => {
      // Additional draw attempt once video has enough data
      if (video.paused) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            drawSingleFrame(ctx, video, canvas, transformRef.current);
          }
        }
      }
    };

    const handlePlay = () => {
      onPlayStateChangeRef.current?.(true);
      startLoop();
    };

    const handlePause = () => {
      onPlayStateChangeRef.current?.(false);
      stopLoopRef.current?.();
      stopLoopRef.current = null;
      // Draw a single frame so the canvas isn't blank
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const activeOverlays = getVisibleOverlays();
          drawSingleFrame(ctx, video, canvas, transformRef.current, activeOverlays);
        }
      }
    };

    const handleSeeked = () => {
      isSeekingInternalRef.current = false;
      // Redraw frame at new position
      const canvas = canvasRef.current;
      if (canvas && video.paused) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const activeOverlays = getVisibleOverlays();
          drawSingleFrame(ctx, video, canvas, transformRef.current, activeOverlays);
        }
      }
    };

    const handleEnded = () => {
      onPlayStateChangeRef.current?.(false);
      stopLoopRef.current?.();
      stopLoopRef.current = null;
    };

    const handleTimeUpdate = () => {
      // Fallback time update for when rAF loop isn't running
      onTimeUpdateRef.current?.(video.currentTime * 1000);
    };

    // ─── Attach listeners ───────────────────────────────────────
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    // ─── Set source ─────────────────────────────────────────────
    // This effect only runs when `src` changes, so always set it.
    // (Cannot compare video.src === src because browsers normalize to absolute URLs)
    if (prevSrcRef.current !== src) {
      prevSrcRef.current = src;
      video.src = src;
      video.load();
    } else if (video.readyState >= 1) {
      // Source already loaded (e.g. effect re-run with same src)
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      stopLoopRef.current?.();
    };
  }, [src, startLoop, getVisibleOverlays]);

  // ─── Sync play/pause from editor ──────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying === undefined || !isLoaded) return;

    if (isPlaying && video.paused) {
      video.play().catch(() => {});
    }
    if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, isLoaded]);

  // ─── Sync seek from editor ────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || currentTime == null || !isLoaded) return;

    const currentMs = video.currentTime * 1000;
    if (Math.abs(currentMs - currentTime) > 150) {
      isSeekingInternalRef.current = true;
      video.currentTime = currentTime / 1000;
    }
  }, [currentTime, isLoaded]);

  // ─── Redraw on transform change (when paused) ────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.paused || !isLoaded) return;
    drawCurrentFrame();
  }, [stretchX, stretchY, offsetX, offsetY, drawCurrentFrame, isLoaded]);

  // ─── Redraw on overlay change (when paused) ───────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.paused || !isLoaded) return;
    drawCurrentFrame();
  }, [overlays, timelineTimeMs, isLoaded, drawCurrentFrame]);

  // ─── Actions ──────────────────────────────────────────────────────
  const actions = {
    play: useCallback(() => { videoRef.current?.play().catch(() => {}); }, []),
    pause: useCallback(() => { videoRef.current?.pause(); }, []),
    toggle: useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.paused ? v.play().catch(() => {}) : v.pause();
    }, []),
    seek: useCallback((sec: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime += sec;
    }, []),
    setTime: useCallback((t: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = t;
    }, []),
    setVolume: useCallback((vol: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.volume = vol;
      setVolumeState(vol);
    }, []),
    toggleMute: useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = !v.muted;
      setMutedState(v.muted);
    }, []),
    setPlaybackRate: useCallback((r: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.playbackRate = r;
      setPlaybackRateState(r);
    }, []),
    fullscreen: useCallback(() => {
      canvasRef.current?.requestFullscreen?.();
    }, []),
  };

  const state = {
    duration,
    currentTime: videoCurrentTime,
    volume,
    muted,
    playbackRate,
    isLoaded,
    paused: !isPlaying,
  };

  const transform = {
    stretchX,
    stretchY,
    offsetX,
    offsetY,
    setStretchX,
    setStretchY,
    setOffsetX,
    setOffsetY,
    reset: useCallback(() => {
      setStretchX(1);
      setStretchY(1);
      setOffsetX(0);
      setOffsetY(0);
    }, []),
  };

  const trim = {
    trimStart,
    trimEnd,
    setTrimStart,
    setTrimEnd,
  };

  return {
    videoRef,
    canvasRef,
    state,
    actions,
    transform,
    trim,
  };
}
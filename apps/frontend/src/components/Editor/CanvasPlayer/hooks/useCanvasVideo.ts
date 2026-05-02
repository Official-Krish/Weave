import { useEffect, useRef, useState, useCallback } from "react";
import { startRenderLoop, drawSingleFrame } from "../utils/RenderLoop";
import type { RenderState, RenderOverlay } from "../utils/RenderLoop";
import type { Overlay, ClipTransition } from "../../types";

export interface ActiveTransitionInfo {
  type: ClipTransition;
  progress: number;
  position?: "start" | "end";
  sourceVideo?: HTMLVideoElement;
  targetVideo?: HTMLVideoElement;
}

export interface UseCanvasVideoOptions {
  currentTime?: number; // ms — seek target from editor
  isPlaying?: boolean;
  onTimeUpdate?: (timeMs: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
  overlays?: Overlay[];
  timelineTimeMs?: number;
  videoAlpha?: number;
  audioClips?: Array<{
    assetId: string;
    url: string;
    timelineStartMs: number;
    durationMs: number;
    sourceStartMs: number;
    muted?: boolean;
    volume?: number;
    audioMode?: "replace" | "layer";
  }>;
  /** Active transition state computed by useActiveTransition hook */
  activeTransition?: ActiveTransitionInfo | null;
}

export function useCanvasVideo(src: string, options: UseCanvasVideoOptions = {}) {
  const {
    currentTime,
    isPlaying,
    onTimeUpdate,
    onPlayStateChange,
    overlays = [],
    timelineTimeMs = 0,
    videoAlpha = 1,
    audioClips = [],
    activeTransition = null,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    videoAlpha: 1,
  });

  const activeTransitionRef = useRef<ActiveTransitionInfo | null>(null);

  const overlaysRef = useRef<Overlay[]>([]);
  const timelineTimeMsRef = useRef(0);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlayStateChangeRef = useRef(onPlayStateChange);

  const getActiveAudioClip = useCallback((timeMs: number) => {
    return audioClips.find(
      (clip) =>
        timeMs >= clip.timelineStartMs &&
        timeMs < clip.timelineStartMs + clip.durationMs
    ) ?? null;
  }, [audioClips]);

  // Update refs synchronously during render (no effects needed for refs)
  activeTransitionRef.current = activeTransition ?? null;
  transformRef.current = {
    stretchX, stretchY, offsetX, offsetY, trimStart, trimEnd, videoAlpha,
    activeTransition: activeTransitionRef.current
      ? {
          type: activeTransitionRef.current.type,
          progress: activeTransitionRef.current.progress,
          position: activeTransitionRef.current.position,
          sourceVideo: activeTransitionRef.current.sourceVideo,
          targetVideo: activeTransitionRef.current.targetVideo,
        }
      : undefined,
  };
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

  const syncExternalAudio = useCallback(async () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const activeAudioClip = getActiveAudioClip(timelineTimeMsRef.current);
    const shouldReplaceSourceAudio = Boolean(activeAudioClip && (activeAudioClip.audioMode ?? "replace") === "replace");

    if (!activeAudioClip || !isPlaying) {
      audio.pause();
      if (!shouldReplaceSourceAudio) {
        video.muted = muted;
      }
      return;
    }

    // Only change audio src if it's different (avoid redundant load() calls)
    if (audio.src !== activeAudioClip.url) {
      audio.src = activeAudioClip.url;
      // Note: Use srcObject instead of src+load() when possible for better memory efficiency
      // audio.load() is only called here when URL changes
      audio.load();
    }

    const timelineOffsetMs = timelineTimeMsRef.current - activeAudioClip.timelineStartMs;
    const nextAudioTime = Math.max(0, (activeAudioClip.sourceStartMs + timelineOffsetMs) / 1000);
    if (Number.isFinite(nextAudioTime) && Math.abs(audio.currentTime - nextAudioTime) > 0.15) {
      audio.currentTime = nextAudioTime;
    }

    audio.volume = Math.max(0, Math.min(1, activeAudioClip.volume ?? 1));
    audio.muted = Boolean(activeAudioClip.muted);

    if (shouldReplaceSourceAudio) {
      video.muted = true;
    } else {
      video.muted = muted;
    }

    try {
      await audio.play();
    } catch {
      // best effort: if autoplay is blocked, the video still renders and the next user gesture will resume audio
    }
  }, [getActiveAudioClip, isPlaying, muted]);

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

    const handleLoadedData = () => {
      setDuration(video.duration);
      setIsLoaded(true);

      const canvas = canvasRef.current;
      if (canvas) {
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
      audioRef.current?.pause();
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
      audioRef.current?.pause();
    };

    const handleTimeUpdate = () => {
      // Fallback time update for when rAF loop isn't running
      onTimeUpdateRef.current?.(video.currentTime * 1000);
    };

    // ─── Attach listeners ───────────────────────────────────────
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
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
      if (video.readyState >= 2) {
        handleLoadedData();
      }
    } else if (video.readyState >= 1) {
      // Source already loaded (e.g. effect re-run with same src)
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      stopLoopRef.current?.();
    };
  }, [src, startLoop, getVisibleOverlays]);

  useEffect(() => {
    void syncExternalAudio();
  }, [syncExternalAudio, timelineTimeMs, isPlaying, audioClips]);

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
  }, [stretchX, stretchY, offsetX, offsetY, videoAlpha, drawCurrentFrame, isLoaded]);

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
    audioRef,
    canvasRef,
    state,
    actions,
    transform,
    trim,
  };
}
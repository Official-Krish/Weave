import { useEffect, useRef, useState } from "react";

export function useVideoController({
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayStateChange,
}: {
    currentTime?: number;
    isPlaying?: boolean;
    onTimeUpdate?: (t: number) => void;
    onPlayStateChange?: (playing: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [state, setState] = useState({
    paused: true,
    duration: 0,
    currentTime: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
  });

  const video = videoRef.current;

  // Sync play/pause from outside (EDITOR → PLAYER)
  useEffect(() => {
    if (!video) return;
    if (isPlaying === undefined) return;

    if (isPlaying && video.paused) video.play();
    if (!isPlaying && !video.paused) video.pause();
  }, [isPlaying]);

  // Sync seek (EDITOR → PLAYER)
  useEffect(() => {
    if (!video || currentTime == null) return;

    const current = video.currentTime * 1000;
    if (Math.abs(current - currentTime) > 200) {
      video.currentTime = currentTime / 1000;
    }
  }, [currentTime]);

  // Internal listeners (PLAYER → EDITOR)
  useEffect(() => {
    if (!video) return;

    const update = () => {
      const buffered = video.buffered.length
        ? video.buffered.end(video.buffered.length - 1)
        : 0;

      setState({
        paused: video.paused,
        duration: video.duration || 0,
        currentTime: video.currentTime,
        buffered,
        volume: video.volume,
        muted: video.muted,
        playbackRate: video.playbackRate,
      });

      onTimeUpdate?.(video.currentTime * 1000);
    };

    video.addEventListener("timeupdate", update);
    video.addEventListener("play", () => onPlayStateChange?.(true));
    video.addEventListener("pause", () => onPlayStateChange?.(false));
    video.addEventListener("loadedmetadata", update);
    video.addEventListener("progress", update);

    return () => {
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("progress", update);
    };
  }, [video]);

  const actions = {
    toggle: () => (video?.paused ? video.play() : video?.pause()),
    play: () => video?.play(),
    pause: () => video?.pause(),

    seek: (sec: number) => {
      if (!video) return;
      video.currentTime += sec;
    },

    setTime: (t: number) => {
      if (!video) return;
      video.currentTime = t;
    },

    setVolume: (v: number) => {
      if (!video) return;
      video.volume = v;
    },

    toggleMute: () => {
      if (!video) return;
      video.muted = !video.muted;
    },

    setPlaybackRate: (r: number) => {
      if (!video) return;
      video.playbackRate = r;
    },

    fullscreen: () => video?.requestFullscreen(),

    pip: async () => {
      if (!video) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    },
  };

  return { videoRef, state, actions };
}
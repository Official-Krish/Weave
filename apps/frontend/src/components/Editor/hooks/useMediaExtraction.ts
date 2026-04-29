import { useState, useCallback, useEffect } from "react";
import type { Asset } from "../types";

export function useMediaExtraction(
  assetsById: Record<string, Asset>,
  sourceUrl: string,
  durationMs: number
) {
  const [thumbnailsByAsset, setThumbnailsByAsset] = useState<Record<string, string[]>>({});
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const extractThumbnailsForAsset = useCallback(async (assetId: string, url: string, assetDurationMs: number) => {
    try {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.preload = "auto";
      video.muted = true;
      video.src = url;

      await new Promise<void>((resolve, reject) => {
        const onLoaded = () => { video.removeEventListener("loadedmetadata", onLoaded); video.removeEventListener("error", onError); resolve(); };
        const onError = () => { video.removeEventListener("loadedmetadata", onLoaded); video.removeEventListener("error", onError); reject(new Error("failed to load video metadata")); };
        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("error", onError);
      });

      const durSec = (assetDurationMs > 0 ? assetDurationMs : video.duration * 1000) / 1000;
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const count = Math.min(40, Math.max(10, Math.floor(durSec * 1000 / 1500)));
      const thumbs: string[] = [];
      for (let i = 0; i < count; i += 1) {
        const t = durSec * (i / Math.max(1, count - 1));
        await new Promise<void>((resolve) => {
          const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
          video.addEventListener("seeked", onSeeked, { once: true });
          video.currentTime = Math.max(0, Math.min(t, durSec - 0.05));
        });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbs.push(canvas.toDataURL("image/jpeg", 0.62));
      }
      setThumbnailsByAsset((prev) => ({ ...prev, [assetId]: thumbs }));
    } catch (error) {
      console.warn(`Thumbnail extraction failed for asset ${assetId}`, error);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(assetsById).length === 0) return;
    let cancelled = false;

    for (const asset of Object.values(assetsById)) {
      if (asset.assetType === "VIDEO" && !thumbnailsByAsset[asset.id] && asset.url) {
        if (!cancelled) {
          void extractThumbnailsForAsset(asset.id, asset.url, asset.durationMs || durationMs);
        }
      }
    }

    if (sourceUrl && durationMs > 0 && waveformData.length === 0) {
      const extractWaveform = async () => {
        try {
          const response = await fetch(sourceUrl);
          const data = await response.arrayBuffer();
          const audioCtx = new AudioContext();
          const audioBuffer = await audioCtx.decodeAudioData(data.slice(0));
          const channelData = audioBuffer.getChannelData(0);
          const bins = 240;
          const blockSize = Math.max(1, Math.floor(channelData.length / bins));
          const points = Array.from({ length: bins }, (_, i) => {
            const start = i * blockSize;
            const end = Math.min(channelData.length, start + blockSize);
            let sum = 0;
            for (let j = start; j < end; j += 1) sum += Math.abs(channelData[j]);
            return sum / Math.max(1, end - start);
          });
          const max = Math.max(...points, 0.0001);
          if (!cancelled) setWaveformData(points.map((p) => p / max));
          void audioCtx.close();
        } catch (error) {
          console.warn("Waveform extraction failed", error);
          if (!cancelled) setWaveformData([]);
        }
      };
      void extractWaveform();
    }

    return () => { cancelled = true; };
  }, [assetsById, sourceUrl, durationMs, thumbnailsByAsset, waveformData.length, extractThumbnailsForAsset]);

  return { thumbnailsByAsset, waveformData, extractThumbnailsForAsset };
}

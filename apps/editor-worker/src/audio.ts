import * as fs from "node:fs/promises";
import type { AudioClipPlan } from "./types";

export function buildAudioMixArgs(baseVideoPath: string, audioClips: AudioClipPlan[], outputPath: string) {
  const args = ["-y", "-i", baseVideoPath];
  const replaceIntervals = audioClips
    .filter((clip) => clip.audioMode === "replace")
    .map((clip) => ({ start: clip.timelineStartMs / 1000, end: (clip.timelineStartMs + clip.durationMs) / 1000 }));

  const replaceExpr = replaceIntervals.length
    ? `if(gt(${replaceIntervals.map((interval) => `between(t,${interval.start.toFixed(2)},${interval.end.toFixed(2)})`).join("+")},0),0,1)`
    : "1";

  const filterParts: string[] = [`[0:a]volume='${replaceExpr}',aresample=osr=48000:async=1[a0]`];
  const inputLabels = ["[a0]"];

  audioClips.forEach((clip, index) => {
    const inputIndex = index + 1;
    args.push(
      "-ss", (clip.sourceStartMs / 1000).toFixed(3),
      "-t", (clip.durationMs / 1000).toFixed(3),
      "-i", clip.sourcePath,
    );

    const label = `a${inputIndex}`;
    const delay = Math.round(Math.max(0, clip.timelineStartMs));
    const volume = clip.volume.toFixed(3);

    filterParts.push(`[${inputIndex}:a]aresample=osr=48000:async=1,adelay=${delay}|${delay},volume=${volume}[${label}]`);
    inputLabels.push(`[${label}]`);
  });

  filterParts.push(`${inputLabels.join("")}amix=inputs=${inputLabels.length}:duration=first:dropout_transition=2[mix]`);

  args.push(
    "-filter_complex", filterParts.join(";"),
    "-map", "0:v",
    "-map", "[mix]",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "320k",
    "-ar", "48000",
    outputPath,
  );

  return args;
}

export async function buildConcatArgs(parts: string[], output: string) {
  const listPath = output.replace(/\.mp4$/, "_concat.txt");
  const content = parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  await fs.writeFile(listPath, content, "utf8");

  return {
    args: [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "22",
      "-c:a", "aac",
      "-b:a", "320k",
      "-ar", "48000",
      output,
    ],
    listPath,
  };
}

export function toSec(t?: string): number {
  if (!t) return NaN;

  // Ignore optional cue settings after timestamp (e.g. "00:00:05.000 align:start")
  const timeToken = t.trim().split(/\s+/)[0];
  const parts = timeToken.split(":");

  if (parts.length === 3) {
    return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + parseFloat(parts[2]);
  }

  if (parts.length !== 2) {
    return NaN;
  }

  return Number(parts[0]) * 60 + parseFloat(parts[1]);
}

export function resolveThumbnailUrl(rawUrl: string, baseVttUrl: string): string {
  try {
    const absoluteBase = new URL(baseVttUrl, window.location.href);
    return new URL(rawUrl, absoluteBase).toString();
  } catch {
    return rawUrl;
  }
}

export function fmt(t: number): string {
  if (!isFinite(t) || t < 0) return "0:00";
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
import type { Notification } from "./types";

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function groupByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {};
  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const now = new Date();
    let label: string;
    if (d.toDateString() === now.toDateString()) label = "Today";
    else {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      label = d.toDateString() === yesterday.toDateString()
        ? "Yesterday"
        : d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  return groups;
}
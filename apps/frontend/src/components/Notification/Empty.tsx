import type { Filter } from "./types";
import { motion } from "motion/react";

export function EmptyState({ filter }: { filter: Filter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-[28px] border border-white/8 bg-white/[0.03] py-20 text-center shadow-[0_14px_50px_rgba(0,0,0,0.18)]"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-zinc-400" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-zinc-100">
        {filter === "Unread" ? "You're all caught up" : "No notifications"}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {filter === "Unread"
          ? "New activity will appear here"
          : `No ${filter.toLowerCase()} notifications yet`}
      </p>
    </motion.div>
  );
}

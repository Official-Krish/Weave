import type { Filter } from "./types";
import { motion } from "motion/react";

export function EmptyState({ filter }: { filter: Filter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-zinc-400" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {filter === "Unread" ? "You're all caught up" : "No notifications"}
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
        {filter === "Unread"
          ? "New activity will appear here"
          : `No ${filter.toLowerCase()} notifications yet`}
      </p>
    </motion.div>
  );
}
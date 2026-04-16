import { TYPE_CONFIG } from "./config";
import { timeAgo } from "./helpers";
import type { Notification } from "./types";
import { motion } from "motion/react";

export function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  onAcceptRecording,
  onDeclineRecording,
  onAcceptInvite,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAcceptRecording: (roomId: string, requestedBy: string, notifId: string) => void;
  onDeclineRecording: (notifId: string) => void;
  onAcceptInvite: (roomId: string, notifId: string) => void;
}) {
  const config = TYPE_CONFIG[notification.type];
  const isActionable =
    notification.type === "RECORDING_REQUEST" || notification.type === "MEETING_INVITE";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className={`
        relative group flex gap-4 p-4 rounded-xl border transition-all duration-200
        ${notification.isRead
          ? "bg-white/40 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60"
          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700/80 shadow-sm shadow-black/5 dark:shadow-black/20"
        }
        hover:border-zinc-300 dark:hover:border-zinc-600
      `}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <motion.div
          layoutId={`dot-${notification.id}`}
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500"
        />
      )}

      {/* Icon */}
      <div
        className={`
          flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border
          ${config.bg} ${config.accent}
        `}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span
              className={`
                text-[11px] font-semibold uppercase tracking-widest
                ${config.accent}
              `}
            >
              {config.label}
            </span>
            <p
              className={`
                mt-0.5 text-sm leading-snug
                ${notification.isRead
                  ? "text-zinc-500 dark:text-zinc-500"
                  : "text-zinc-800 dark:text-zinc-100 font-medium"
                }
              `}
            >
              {notification.message}
            </p>
          </div>
          <span className="flex-shrink-0 text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        {/* Room metadata pill */}
        {notification.metadata?.roomId && (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="currentColor">
                <circle cx="6" cy="6" r="2" />
                <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {notification.metadata.roomId}
            </span>
          </div>
        )}

        {/* Scheduled time for reminders */}
        {notification.type === "MEETING_REMINDER" && notification.metadata?.scheduledAt && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Scheduled:{" "}
            {new Date(notification.metadata.scheduledAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        {/* Failed reason */}
        {notification.type === "RECORDING_FAILED" && notification.metadata?.reason && (
          <p className="text-xs text-red-400 dark:text-red-400 font-mono">
            ↳ {notification.metadata.reason}
          </p>
        )}

        {/* Action buttons */}
        {isActionable && !notification.isRead && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.type === "RECORDING_REQUEST" && (
              <>
                <button
                  onClick={() =>
                    onAcceptRecording(
                      notification.metadata!.roomId!,
                      notification.metadata!.requestedBy!,
                      notification.id
                    )
                  }
                  className="
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-amber-500 hover:bg-amber-400 text-black
                    transition-all duration-150 active:scale-95
                    shadow-sm shadow-amber-500/20
                  "
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path d="M2 4a2 2 0 012-2h5l4 4v6a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm9.5 3.5l-4-4H4a.5.5 0 00-.5.5v8a.5.5 0 00.5.5h6a.5.5 0 00.5-.5V7.5z" />
                    <path d="M5.5 9.5l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Grant Access
                </button>
                <button
                  onClick={() => onDeclineRecording(notification.id)}
                  className="
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                    text-zinc-600 dark:text-zinc-300
                    transition-all duration-150 active:scale-95
                  "
                >
                  Decline
                </button>
              </>
            )}

            {notification.type === "MEETING_INVITE" && (
              <>
                <button
                  onClick={() =>
                    onAcceptInvite(notification.metadata!.roomId!, notification.id)
                  }
                  className="
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-blue-500 hover:bg-blue-400 text-white
                    transition-all duration-150 active:scale-95
                    shadow-sm shadow-blue-500/20
                  "
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M8 14a6 6 0 100-12 6 6 0 000 12zm1-9a1 1 0 10-2 0v2H5a1 1 0 100 2h2v2a1 1 0 102 0V9h2a1 1 0 100-2H9V5z" clipRule="evenodd" />
                  </svg>
                  Join Meeting
                </button>
                <button
                  onClick={() => onDeclineRecording(notification.id)}
                  className="
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                    text-zinc-600 dark:text-zinc-300
                    transition-all duration-150 active:scale-95
                  "
                >
                  Decline
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Delete on hover */}
      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="
          absolute top-3 right-8 opacity-0 group-hover:opacity-100
          w-6 h-6 flex items-center justify-center rounded-md
          text-zinc-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10
          transition-all duration-150
        "
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M6 2h4a1 1 0 011 1v1H5V3a1 1 0 011-1zM3 5h10l-.8 8H3.8L3 5zm3 2v5h1V7H6zm3 0v5h1V7H9z" />
        </svg>
      </motion.button>
    </motion.div>
  );
}
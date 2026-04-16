import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { FILTERS, type Filter, type Notification } from "@/components/Notification/types";
import { groupByDate } from "@/components/Notification/helpers";
import { NotificationCard } from "@/components/Notification/NotificationCard";
import { EmptyState } from "@/components/Notification/Empty";
import { http } from "@/https";
import { getHttpErrorMessage } from "@/lib/httpError";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const notificationsQueryKey = ["notifications"];

type NotificationsResponse = {
  notifications: Array<
    Omit<Notification, "metadata"> & {
      metadata?: Notification["metadata"] | null;
    }
  >;
};

type NotificationActionInput = {
  roomId: string;
  notificationId: string;
};

const api = {
  getNotifications: (): Promise<Notification[]> =>
    http.get<NotificationsResponse>("/notifications").then((response) =>
      response.data.notifications.map((notification) => ({
        ...notification,
        metadata: notification.metadata ?? undefined,
      }))
    ),

  markRead: (id: string): Promise<void> =>
    http
      .post("/notifications/mark-as-read", { notificationIds: [id] })
      .then(() => undefined),

  markAllRead: (notificationIds: string[]): Promise<void> =>
    http
      .post("/notifications/mark-as-read", { notificationIds })
      .then(() => undefined),

  deleteNotification: (id: string): Promise<void> =>
    http
      .delete("/notifications/delete", { data: { notificationIds: [id] } })
      .then(() => undefined),

  approveRecordingRequest: ({ roomId, notificationId }: NotificationActionInput): Promise<void> =>
    http
      .post("/notifications/create", {
        type: "RECORDING_REQUEST_APPROVED",
        roomId,
        notificationId,
      })
      .then(() => undefined),

  denyRecordingRequest: ({ roomId, notificationId }: NotificationActionInput): Promise<void> =>
    http
      .post("/notifications/create", {
        type: "RECORDING_REQUEST_DENIED",
        roomId,
        notificationId,
      })
      .then(() => undefined),

  acceptMeetingInvite: (roomId: string): Promise<void> =>
    http.post(`/meeting/join/${roomId}`, {}).then(() => undefined),
};

function SkeletonCard() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-2.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3.5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-1/3 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const notificationsQuery = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: api.getNotifications,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  const notifications = notificationsQuery.data ?? [];

  const markRead = useMutation({
    mutationFn: api.markRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      const prev = queryClient.getQueryData<Notification[]>(notificationsQueryKey);
      queryClient.setQueryData<Notification[]>(notificationsQueryKey, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      queryClient.setQueryData(notificationsQueryKey, ctx?.prev);
      toast.error("Failed to mark notification as read");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });

  const markAllRead = useMutation({
    mutationFn: api.markAllRead,
    onMutate: async (notificationIds) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      const prev = queryClient.getQueryData<Notification[]>(notificationsQueryKey);
      queryClient.setQueryData<Notification[]>(notificationsQueryKey, (old = []) =>
        old.map((n) =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(notificationsQueryKey, ctx?.prev);
      toast.error("Failed to mark notifications as read");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });

  const deleteNotif = useMutation({
    mutationFn: api.deleteNotification,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey });
      const prev = queryClient.getQueryData<Notification[]>(notificationsQueryKey);
      queryClient.setQueryData<Notification[]>(notificationsQueryKey, (old = []) =>
        old.filter((n) => n.id !== id)
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      queryClient.setQueryData(notificationsQueryKey, ctx?.prev);
      toast.error("Failed to delete notification");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });

  const acceptRecording = useMutation({
    mutationFn: api.approveRecordingRequest,
    onSuccess: async (_d, vars) => {
      await api.deleteNotification(vars.notificationId);
      queryClient.setQueryData<Notification[]>(notificationsQueryKey, (old = []) =>
        old.filter((n) => n.id !== vars.notificationId)
      );
      toast.success("Recording access approved");
    },
    onError: (error) =>
      toast.error(getHttpErrorMessage(error, "Could not approve recording access")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });

  const acceptInvite = useMutation({
    mutationFn: ({ roomId }: { roomId: string; notifId: string }) =>
      api.acceptMeetingInvite(roomId),
    onSuccess: (_d, vars) => {
      markRead.mutate(vars.notifId);
      toast.success("Meeting joined successfully");
    },
    onError: (error) =>
      toast.error(getHttpErrorMessage(error, "Could not join meeting")),
  });

  const declineRecording = useMutation({
    mutationFn: api.denyRecordingRequest,
    onSuccess: async (_d, vars) => {
      await api.deleteNotification(vars.notificationId);
      queryClient.setQueryData<Notification[]>(notificationsQueryKey, (old = []) =>
        old.filter((n) => n.id !== vars.notificationId)
      );
      toast.success("Recording request declined");
    },
    onError: (error) =>
      toast.error(getHttpErrorMessage(error, "Could not decline recording request")),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return !n.isRead;
    if (activeFilter === "Recording")
      return n.type.startsWith("RECORDING");
    if (activeFilter === "Meeting")
      return n.type.startsWith("MEETING");
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const grouped = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0d0d0d] transition-colors duration-300">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,158,11,0.06) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                {unreadCount > 0 ? (
                  <>
                    <span className="text-amber-500 font-semibold">{unreadCount} unread</span>
                    {" · "}{notifications.length} total
                  </>
                ) : (
                  "All caught up"
                )}
              </p>
            </div>

            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() =>
                    markAllRead.mutate(
                      notifications.filter((n) => !n.isRead).map((n) => n.id)
                    )
                  }
                  disabled={markAllRead.isPending}
                  className="
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700
                    text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700
                    transition-all duration-150 active:scale-95 disabled:opacity-50
                  "
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M2.5 3a.5.5 0 000 1h11a.5.5 0 000-1h-11zm0 4a.5.5 0 000 1h11a.5.5 0 000-1h-11zm0 4a.5.5 0 000 1h6a.5.5 0 000-1h-6z" clipRule="evenodd" />
                  </svg>
                  Mark all read
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 mt-5 p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 w-fit">
            {FILTERS.map((f) => {
              const count =
                f === "Unread"
                  ? unreadCount
                  : f === "Recording"
                  ? notifications.filter((n) => n.type.startsWith("RECORDING")).length
                  : f === "Meeting"
                  ? notifications.filter((n) => n.type.startsWith("MEETING")).length
                  : notifications.length;

              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`
                    relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                    ${activeFilter === f
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }
                  `}
                >
                  {activeFilter === f && (
                    <motion.div
                      layoutId="filter-bg"
                      className="absolute inset-0 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/80 dark:border-zinc-700"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {f}
                    {count > 0 && (
                      <span
                        className={`
                          inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold
                          ${f === "Unread" && count > 0
                            ? "bg-amber-500 text-black"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                          }
                        `}
                      >
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Notification list */}
        {notificationsQuery.isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : notificationsQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {getHttpErrorMessage(notificationsQuery.error, "Could not load notifications.")}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {Object.entries(grouped).map(([date, items]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Date label */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-zinc-200/80 dark:bg-zinc-800" />
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {items.map((n) => (
                        <NotificationCard
                          key={n.id}
                          notification={n}
                          onMarkRead={(id) => markRead.mutate(id)}
                          onDelete={(id) => deleteNotif.mutate(id)}
                          onAcceptRecording={(roomId, _requestedBy, notifId) =>
                            acceptRecording.mutate({ roomId, notificationId: notifId })
                          }
                          onDeclineRecording={(notifId) => {
                            const notification = notifications.find((item) => item.id === notifId);
                            if (!notification?.metadata?.roomId) {
                              toast.error("Missing room information for this request");
                              return;
                            }

                            declineRecording.mutate({
                              roomId: notification.metadata.roomId,
                              notificationId: notifId,
                            });
                          }}
                          onAcceptInvite={(roomId, notifId) =>
                            acceptInvite.mutate({ roomId, notifId })
                          }
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

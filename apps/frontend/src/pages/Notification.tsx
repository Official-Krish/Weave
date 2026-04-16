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
    <div className="animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex gap-4">
      <div className="h-11 w-11 rounded-2xl bg-white/[0.06] flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-2.5 w-24 rounded bg-white/[0.06]" />
        <div className="h-3.5 w-3/4 rounded bg-white/[0.06]" />
        <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
      </div>
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
  const actionableCount = notifications.filter(
    (n) => !n.isRead && (n.type === "RECORDING_REQUEST" || n.type === "MEETING_INVITE")
  ).length;
  const recordingCount = notifications.filter((n) => n.type.startsWith("RECORDING")).length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090909] px-4 pb-16 pt-10 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(245,166,35,0.14),transparent_56%)]" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: "easeOut" }}
          className="mb-6 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,22,22,0.96),rgba(10,10,10,0.94))] p-7 shadow-[0_18px_80px_rgba(0,0,0,0.38)]"
        >
          <div className="gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200/80">
                Notification Center
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Keep approvals, reminders, and recording activity neatly in view.
              </h1>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                A quieter, production-ready inbox with clearer hierarchy, soft motion, and dashboard-aligned surfaces for faster triage.
              </p>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-[#111111]/94 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.34)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Inbox Filters
              </div>
              <div className="mt-4 space-y-2">
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
                      className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                        activeFilter === f
                          ? "border-amber-400/20 bg-amber-400/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          : "border-white/8 bg-white/[0.02] text-zinc-400 hover:border-white/12 hover:bg-white/[0.04] hover:text-zinc-200"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{f}</div>
                        <div className="mt-1 text-[11px] text-zinc-500">
                          {f === "All"
                            ? "Everything in your inbox"
                            : f === "Unread"
                            ? "New items only"
                            : f === "Recording"
                            ? "Access and media updates"
                            : "Invites and reminders"}
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase ${
                        activeFilter === f ? "bg-black/20 text-amber-100" : "bg-white/[0.05] text-zinc-500"
                      }`}>
                        {count > 99 ? "99+" : count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#111111]/94 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.34)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Queue Status
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { label: "Unread items", value: unreadCount, width: unreadCount === 0 ? "8%" : "72%", bar: "bg-amber-400" },
                  { label: "Action required", value: actionableCount, width: actionableCount === 0 ? "8%" : "48%", bar: "bg-sky-400" },
                  { label: "Recently processed", value: notifications.length - unreadCount, width: notifications.length ? "64%" : "8%", bar: "bg-emerald-400" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">{row.label}</span>
                      <span className="text-sm font-medium text-white">{row.value}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <div className={`h-full rounded-full ${row.bar}`} style={{ width: row.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.98),rgba(12,12,12,0.94))] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.38)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
                Notifications
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {unreadCount > 0 ? (
                  <>
                    <span className="font-semibold text-amber-300">{unreadCount} unread</span>
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
                    flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3.5 py-2 text-xs font-medium
                    text-amber-100 shadow-[0_12px_24px_rgba(245,166,35,0.08)]
                    transition-all duration-150 hover:bg-amber-400/14 active:scale-[0.98] disabled:opacity-50
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
        </motion.div>

        {/* Notification list */}
        {notificationsQuery.isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : notificationsQuery.isError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      {date}
                    </span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
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
      </div>
    </div>
  );
}

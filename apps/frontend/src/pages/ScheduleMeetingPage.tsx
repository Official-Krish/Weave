import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarPlus,
  LoaderCircle,
  Mail,
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { circOut, circIn } from "framer-motion";
import type { ScheduleMeetingResponse } from "@repo/types/api";
import { DatePickerTime } from "@/components/ui/TimePicker";
import { http } from "@/https";
import { getHttpErrorMessage } from "@/lib/httpError";
import { Checkbox } from "@/components/ui/checkbox"

import {
  type NotificationType,
  NOTIFICATION_OPTIONS,
} from "@/components/ScheduleMeeting/utils";
import { NotificationSelector } from "@/components/ScheduleMeeting/NotificationSelector";

const fadeSlide = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: circOut } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: circIn } },
};

export function ScheduleMeetingPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState("");

  // notification fields
  const [notificationType, setNotificationType] = useState<NotificationType | null>(null);
  const [slackBotToken, setSlackBotToken] = useState("");
  const [slackUserId, setSlackUserId] = useState("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");

  const normalizedInvite = useMemo(() => inviteEmail.trim().toLowerCase(), [inviteEmail]);

  const addInvite = () => {
    if (!normalizedInvite || !normalizedInvite.includes("@") || invites.includes(normalizedInvite)) return;
    setInvites((c) => [...c, normalizedInvite]);
    setInviteEmail("");
  };

  const selectedOption = NOTIFICATION_OPTIONS.find((o) => o.id === notificationType)!;

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (!startAt) throw new Error("Choose a start date and time.");
      const body: Record<string, unknown> = {
        title,
        description: description || undefined,
        startTime: startAt.toISOString(),
        isRecurring,
        recurrenceRule: isRecurring && recurrenceRule.trim() ? recurrenceRule.trim() : undefined,
        invitedParticipants: invites,
        notificationType: notificationType ?? undefined,
      };
      if (notificationType === "SLACK") {
        body.slackBotToken = slackBotToken;
        body.slackUserId = slackUserId;
      }
      if (notificationType === "DISCORD") {
        body.discordWebhookUrl = discordWebhookUrl;
      }
      const response = await http.post<ScheduleMeetingResponse>("/meeting/create/schedule", body);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Meeting scheduled");
      navigate("/dashboard?section=upcoming");
    },
    onError: (error) => {
      toast.error(getHttpErrorMessage(error, "Could not schedule the meeting."));
    },
  });

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#0a0908] px-5 py-10">
      <div className="mx-auto max-w-4xl">

        {/* ── Header ── */}
        <motion.div
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5a623]/55">
              Schedule meeting
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#fff5de]">
              Plan the room before anyone joins
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b49650]/65">
              Pick the start time, add invitees, and choose how participants get notified.
            </p>
          </div>

          <Link
            to="/dashboard?section=upcoming"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-semibold text-[#fff5de]/80 transition hover:border-[#f5a623]/24 hover:text-[#fff5de]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          className="rounded-3xl border border-[#f5a623]/12 bg-[#0f0d0a] p-7"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <div className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">

              {/* ── Left column ── */}
              <div className="space-y-5">

                {/* Title */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b49650]/75">Title</p>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Weekly product sync"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-[#fff5de] outline-none transition focus:border-[#f5a623]/40 focus:ring-2 focus:ring-[#f5a623]/15"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b49650]/75">Description</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share agenda or context for attendees"
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-[#fff5de] outline-none transition focus:border-[#f5a623]/40 focus:ring-2 focus:ring-[#f5a623]/15"
                  />
                </div>

                {/* Date/Time */}
                <DatePickerTime value={startAt} onChange={setStartAt} />

                {/* Recurring */}
                <div className="grid gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <label className="flex items-center gap-3 text-sm text-[#fff5de]">
                    <Checkbox
                      checked={isRecurring}
                      onCheckedChange={checked => setIsRecurring(checked === true)}
                      className="size-4 rounded border-white/20 bg-white/10"
                    />
                    Make this recurring
                  </label>
                  <AnimatePresence>
                    {isRecurring && (
                      <motion.div
                        variants={fadeSlide}
                        key="recurrence"
                      >
                        <input
                          value={recurrenceRule}
                          onChange={(e) => setRecurrenceRule(e.target.value)}
                          placeholder="Optional rule, e.g. every Friday at 10 AM"
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/4 px-4 text-sm text-[#fff5de] outline-none transition focus:border-[#f5a623]/40 focus:ring-2 focus:ring-[#f5a623]/15"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Notification Selector ── */}
                <NotificationSelector
                  notificationType={notificationType}
                  setNotificationType={setNotificationType}
                  slackBotToken={slackBotToken}
                  setSlackBotToken={setSlackBotToken}
                  slackUserId={slackUserId}
                  setSlackUserId={setSlackUserId}
                  discordWebhookUrl={discordWebhookUrl}
                  setDiscordWebhookUrl={setDiscordWebhookUrl}
                />
              </div>

              {/* ── Right column ── */}
              <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b49650]/75">
                  Invite participants
                </p>

                <div className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addInvite(); }
                      }}
                      placeholder="participant@email.com"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/4 px-4 pr-10 text-sm text-[#fff5de] outline-none transition focus:border-[#f5a623]/40 focus:ring-2 focus:ring-[#f5a623]/15"
                    />
                    <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#b49650]/60" />
                  </div>
                  <button
                    type="button"
                    onClick={addInvite}
                    className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-[#fff5de] transition hover:border-[#f5a623]/24 hover:bg-[#f5a623]/10"
                  >
                    <UserPlus className="size-4" />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 min-h-[32px]">
                  <AnimatePresence>
                    {invites.length === 0 ? (
                      <p className="text-sm text-[#b49650]/60">No invitees added yet.</p>
                    ) : (
                      invites.map((email) => (
                        <motion.span
                          key={email}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-[#fff5de]"
                        >
                          {email}
                          <button
                            type="button"
                            onClick={() => setInvites((c) => c.filter((i) => i !== email))}
                          >
                            <X className="size-3" />
                          </button>
                        </motion.span>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* What happens next */}
                <div className="mt-6 rounded-2xl border border-[#f5a623]/12 bg-[#f5a623]/6 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl text-[#f5a623]">
                      <CalendarPlus className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#fff5de]">What happens next</p>
                      <p className="mt-1 text-sm leading-6 text-[#b49650]/65">
                        The meeting appears under upcoming. Hosts can start it from the dashboard, and invitees{" "}
                        {notificationType
                          ? `will be notified via ${selectedOption.label}.`
                          : "will get an in-app reminder to join."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <motion.button
              type="button"
              onClick={() => scheduleMutation.mutate()}
              disabled={scheduleMutation.isPending || !title.trim() || !startAt}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#ffd166,#f5a623)] px-5 text-sm font-extrabold text-[#1b1100] transition hover:brightness-105 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {scheduleMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CalendarPlus className="size-4" />
              )}
              Schedule meeting
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

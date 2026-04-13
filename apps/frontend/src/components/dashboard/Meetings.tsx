import {
  CalendarDays,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import type { MeetingListItem } from "@repo/types/api";

type MeetingsProps = {
  meetings: MeetingListItem[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onOpenMeeting: (meetingId: string) => void;
  onOpenRecording: (recordingId: string) => void;
};

function getStatusTone(meeting: MeetingListItem) {
  if (!meeting.isEnded) {
    return "live";
  }

  if (meeting.recordingState === "READY") {
    return "ready";
  }

  if (meeting.recordingState === "FAILED") {
    return "failed";
  }

  return "processing";
}

function getStatusLabel(meeting: MeetingListItem) {
  if (!meeting.isEnded) {
    return "Live";
  }

  if (meeting.recordingState === "READY") {
    return "Ready";
  }

  if (meeting.recordingState === "FAILED") {
    return "Failed";
  }

  return "Processing";
}

export function Meetings({
  meetings,
  isLoading,
  isError,
  errorMessage,
  onOpenMeeting,
  onOpenRecording,
}: MeetingsProps) {
  const liveMeetings = meetings.filter((meeting) => !meeting.isEnded);
  const endedMeetings = meetings.filter((meeting) => meeting.isEnded);

  return (
    <section className="rounded-2xl border border-[#f5a623]/10 bg-white/[0.022] p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5a623]/55">
            Meetings
          </p>
          <h2 className="mt-1 text-[26px] font-black leading-none tracking-tight text-[#fff5de]">
            All meetings in one workspace
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b49650]/65">
            Keep active rooms, ended sessions, and their recording states in the
            same dashboard shell without jumping to another page.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: meetings.length },
            { label: "Live", value: liveMeetings.length },
            { label: "Ready", value: meetings.filter((m) => m.recordingState === "READY").length },
            { label: "Ended", value: endedMeetings.length },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#f5a623]/10 bg-black/18 px-4 py-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b49650]/55">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-black text-[#fff5de]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/10 bg-black/18 px-4 py-2 text-sm text-[#fff5de]/65">
          <LoaderCircle className="size-4 animate-spin" />
          Loading meetings...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/15 bg-red-500/8 px-4 py-3 text-sm text-red-300/85">
          {errorMessage || "Could not load meetings."}
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl border border-[#f5a623]/10 bg-black/18 px-5 py-6 text-sm text-[#a89880]">
          No meetings yet. Your first room will show up here once you create it.
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { title: "Live now", items: liveMeetings },
            { title: "Ended sessions", items: endedMeetings },
          ]
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <div key={group.title}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5a623]/55">
                    {group.title}
                  </p>
                  <span className="text-[11px] text-[#b49650]/45">
                    {group.items.length} item{group.items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3">
                  {group.items.map((meeting, index) => {
                    const tone = getStatusTone(meeting);

                    return (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: index * 0.03 }}
                        className="rounded-2xl border border-[#f5a623]/8 bg-black/18 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-[15px] font-bold text-[#fff5de]">
                                {meeting.roomName?.trim() || `Meeting ${meeting.meetingId.slice(0, 8)}`}
                              </p>
                              <span
                                className={[
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                                  tone === "live"
                                    ? "border border-red-500/20 bg-red-500/12 text-red-300"
                                    : tone === "ready"
                                      ? "border border-green-500/20 bg-green-500/12 text-green-300"
                                      : tone === "failed"
                                        ? "border border-red-500/15 bg-red-500/8 text-red-300"
                                        : "border border-[#f5a623]/20 bg-[#f5a623]/10 text-[#f5a623]",
                                ].join(" ")}
                              >
                                {getStatusLabel(meeting)}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#b49650]/60">
                              <span className="inline-flex items-center gap-1">
                                <Video className="size-3" />
                                {meeting.meetingId}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="size-3" />
                                {meeting.participants.length} participants
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="size-3" />
                                {new Date(meeting.date).toLocaleDateString()}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="size-3" />
                                {meeting.startTime
                                  ? new Date(meeting.startTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Not started"}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {!meeting.isEnded ? (
                              <button
                                type="button"
                                onClick={() => onOpenMeeting(meeting.meetingId)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/15 bg-[#f5a623]/10 px-4 py-2 text-[12px] font-bold text-[#f5a623] transition hover:border-[#f5a623]/30 hover:bg-[#f5a623]/14"
                              >
                                Open room
                                <ChevronRight className="size-3.5" />
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => onOpenRecording(meeting.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[12px] font-semibold text-[#fff5de]/78 transition hover:border-[#f5a623]/18 hover:text-[#fff5de]"
                            >
                              Details
                              <ChevronRight className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

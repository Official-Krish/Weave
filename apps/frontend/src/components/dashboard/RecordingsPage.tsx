import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import type { MeetingDetails } from "@repo/types/api";
import { getHttpErrorMessage } from "@/lib/httpError";

type RecordingsPageProps = {
  meetings: MeetingDetails[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onOpenRecording: (recordingId: string) => void;
};

export function RecordingsPage({
  meetings,
  isLoading,
  isError,
  error,
  onOpenRecording,
}: RecordingsPageProps) {
  const readyRecordings = meetings.filter((meeting) => meeting.recordingState === "READY");
  const processingRecordings = meetings.filter(
    (meeting) =>
      meeting.recordingState === "PROCESSING" ||
      meeting.recordingState === "UPLOADING" ||
      meeting.recordingState === "RECORDING"
  );
  const failedRecordings = meetings.filter((meeting) => meeting.recordingState === "FAILED");

  return (
    <section className="rounded-2xl border border-[#f5a623]/10 bg-white/[0.022] p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5a623]/55">
            Recordings
          </p>
          <h2 className="mt-1 text-[26px] font-black leading-none tracking-tight text-[#fff5de]">
            Playback, export, and status in one view
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b49650]/65">
            Ready assets, in-progress merges, and failed jobs stay visible inside
            the dashboard instead of sending you to a separate route.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ready", value: readyRecordings.length },
            { label: "Processing", value: processingRecordings.length },
            { label: "Failed", value: failedRecordings.length },
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
          Loading recordings...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/15 bg-red-500/8 px-4 py-3 text-sm text-red-300/85">
          <p className="inline-flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            {getHttpErrorMessage(error, "Could not load recordings.")}
          </p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl border border-[#f5a623]/10 bg-black/18 px-5 py-6 text-sm text-[#a89880]">
          No recordings found yet. End a recorded meeting and it will appear here.
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { title: "Ready to export", items: readyRecordings, tone: "ready" },
            { title: "Still processing", items: processingRecordings, tone: "processing" },
            { title: "Attention needed", items: failedRecordings, tone: "failed" },
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

                <div className="grid gap-3 lg:grid-cols-2">
                  {group.items.map((meeting, index) => (
                    <motion.button
                      key={meeting.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: index * 0.03 }}
                      onClick={() => onOpenRecording(meeting.id)}
                      className="rounded-2xl border border-[#f5a623]/8 bg-black/18 p-4 text-left transition hover:border-[#f5a623]/18 hover:bg-black/28"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-bold text-[#fff5de]">
                            {meeting.roomName?.trim() || `Meeting ${meeting.roomId.slice(0, 8)}`}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#b49650]/60">
                            <span className="inline-flex items-center gap-1">
                              <Users className="size-3" />
                              {meeting.joinedParticipants.length} participants
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="size-3" />
                              {new Date(meeting.date).toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="size-3" />
                              {meeting.recordingState || "IDLE"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={[
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                            group.tone === "ready"
                              ? "border border-green-500/20 bg-green-500/12 text-green-300"
                              : group.tone === "failed"
                                ? "border border-red-500/20 bg-red-500/12 text-red-300"
                                : "border border-[#f5a623]/20 bg-[#f5a623]/10 text-[#f5a623]",
                          ].join(" ")}
                        >
                          {group.tone === "ready"
                            ? "Ready"
                            : group.tone === "failed"
                              ? "Failed"
                              : "Processing"}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/10 bg-[#f5a623]/7 px-3 py-1.5 text-[11px] font-medium text-[#f5d08d]">
                          <Video className="size-3.5" />
                          {group.tone === "ready" ? "Open recording" : "View status"}
                        </div>
                        <ChevronRight className="size-4 text-[#f5a623]/70" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
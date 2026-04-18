import { CalendarDays, ChevronRight, Clock3, Sparkles, Users, Video } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import type { MeetingDetails } from "@repo/types/api";

const UPCOMING_MOCK = [
  { day: "14", mon: "Apr", dow: "Mon", name: "Investor Q&A session", time: "10:00 AM", invitees: 6 },
  { day: "16", mon: "Apr", dow: "Wed", name: "UX research — user 04", time: "2:30 PM", invitees: 2 },
  { day: "18", mon: "Apr", dow: "Fri", name: "Sprint planning — v0.9", time: "11:00 AM", invitees: 9 },
];

export function Overview({
    meetings,
    setSection,
}: {
    meetings: MeetingDetails[];
    setSection: (section: "overview" | "meetings" | "recordings") => void;
}) {
    const navigate = useNavigate();
    // Pagination for recent meetings
    const [recentPage, setRecentPage] = useState(1);
    const recentPageSize = 4;
    const totalRecentPages = Math.ceil(meetings.length / recentPageSize);
    const paginatedRecentMeetings = meetings.slice((recentPage - 1) * recentPageSize, recentPage * recentPageSize);

    // Pagination for ready recordings
    const [readyPage, setReadyPage] = useState(1);
    const readyMeetings = meetings.filter((meeting) => meeting.recordingState === "READY");
    const readyPageSize = 3;
    const totalReadyPages = Math.ceil(readyMeetings.length / readyPageSize);
    const paginatedReadyMeetings = readyMeetings.slice((readyPage - 1) * readyPageSize, readyPage * readyPageSize);

    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="grid gap-4 lg:grid-cols-[1fr_320px]"
        >
            <div className="flex flex-col gap-4">
            <SectionCard title="Recent meetings" linkLabel="View all" onLink={() => setSection("meetings")}> 
                {meetings.length === 0 ? (
                  <p className="rounded-xl border border-white/6 bg-white/3 px-4 py-4 text-sm text-[#a89880]">
                      No meetings yet. Create your first one above.
                  </p>
                ) : (
                  paginatedRecentMeetings.map((m, i) => (
                      <MeetingRow key={m.id} meeting={m} index={i} onClick={() => navigate(`/recordings/${m.id}`)} />
                  ))
                )}
                {/* Pagination for recent meetings */}
                {totalRecentPages > 1 && (
                  <div className="pt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                            aria-disabled={recentPage === 1}
                            tabIndex={recentPage === 1 ? -1 : 0}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalRecentPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={recentPage === i + 1}
                              onClick={() => setRecentPage(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setRecentPage((p) => Math.min(totalRecentPages, p + 1))}
                            aria-disabled={recentPage === totalRecentPages}
                            tabIndex={recentPage === totalRecentPages ? -1 : 0}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
            </SectionCard>

            <SectionCard title="Recordings" linkLabel="View all" onLink={() => setSection("recordings")}> 
                {paginatedReadyMeetings.map((m) => (
                  <div
                      key={m.id}
                      onClick={() => navigate(`/recordings/${m.id}`)}
                      className="mb-2 flex cursor-pointer items-center gap-3 rounded-xl border border-[#f5a623]/7 bg-black/18 px-3.5 py-2.5 transition last:mb-0 hover:bg-black/30"
                  >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-[#f5a623]/12 bg-[#f5a623]/8">
                      <Video className="size-4 text-[#f5a623]/60" />
                      </div>
                      <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-[#fff5de]">
                          {m.roomName?.trim() || `Meeting ${m.roomId.slice(0, 8)}`}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#b49650]/60">
                          {new Date(m.date).toLocaleDateString()} · {m.joinedParticipants.length} tracks
                      </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-[#b49650]/50">
                      {Math.round(Math.random() * 1200 + 200)} MB
                      </span>
                  </div>
                ))}
                {readyMeetings.length === 0 && (
                  <p className="rounded-xl border border-white/6 bg-white/3 px-4 py-4 text-sm text-[#a89880]">
                      No ready recordings yet.
                  </p>
                )}
                {/* Pagination for ready recordings */}
                {totalReadyPages > 1 && (
                  <div className="pt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setReadyPage((p) => Math.max(1, p - 1))}
                            aria-disabled={readyPage === 1}
                            tabIndex={readyPage === 1 ? -1 : 0}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                        {Array.from({ length: totalReadyPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={readyPage === i + 1}
                              onClick={() => setReadyPage(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setReadyPage((p) => Math.min(totalReadyPages, p + 1))}
                            aria-disabled={readyPage === totalReadyPages}
                            tabIndex={readyPage === totalReadyPages ? -1 : 0}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
            </SectionCard>
            </div>

            <div className="flex flex-col gap-4">
            <SectionCard
                title="Upcoming meetings"
                extra={
                <span className="inline-flex items-center gap-1 rounded-full border border-[#6482f5]/20 bg-[#6482f5]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8aaaff]/80">
                    <Sparkles className="size-2.5" /> Coming soon
                </span>
                }
            >
                {UPCOMING_MOCK.map((u) => (
                <div key={u.day} className="mb-2 flex items-center gap-3 rounded-xl border border-[#6482f5]/12 bg-[#6482f5]/4 px-3.5 py-2.5 last:mb-0">
                    <div className="flex w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-[#6482f5]/12 py-1.5">
                    <span className="text-[15px] font-black leading-none text-[#a0b9ff]/90">{u.day}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide text-[#8299ff]/55">{u.mon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-[#fff5de]">{u.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#b49650]/60">{u.time} · {u.invitees} invitees</p>
                    </div>
                    <span className="rounded-full border border-[#6482f5]/20 bg-[#6482f5]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#8aaaff]/80">{u.dow}</span>
                </div>
                ))}
                <p className="mt-2 rounded-xl border border-[#6482f5]/12 bg-[#6482f5]/6 px-3 py-2 text-[11px] leading-relaxed text-[#8aaaff]/60">
                Calendar sync and scheduling arrive in the next release.
                </p>
            </SectionCard>
            </div>
        </motion.div>
    )
}
function SectionCard({ title, linkLabel, onLink, extra, children }: { title: string; linkLabel?: string; onLink?: () => void; extra?: ReactNode; children: ReactNode; }) {
  return (
    <div className="rounded-2xl border border-[#f5a623]/10 bg-white/[0.022] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5a623]/55">{title}</p>
        <div className="flex items-center gap-2">
          {extra}
          {linkLabel && (
            <button onClick={onLink} className="flex items-center gap-1 text-[12px] font-semibold text-[#f5a623]/70 transition hover:text-[#f5a623]">
              {linkLabel} <ChevronRight className="size-3" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

const INITIAL_COLORS = ["from-[#ffcf6b] to-[#f5a623]", "from-[#85b7eb] to-[#378add]", "from-[#97c459] to-[#639922]", "from-[#f0997b] to-[#d85a30]", "from-[#afa9ec] to-[#7f77dd]"];
const TEXT_COLORS = ["text-[#1b1100]", "text-[#042c53]", "text-[#173404]", "text-[#4a1b0c]", "text-[#26215c]"];

function MeetingRow({ meeting, index, onClick }: { meeting: MeetingDetails; index: number; onClick: () => void }) {
  const initial = (meeting.roomName?.trim() || "M").charAt(0).toUpperCase();
  const gradient = INITIAL_COLORS[index % INITIAL_COLORS.length];
  const textCol = TEXT_COLORS[index % TEXT_COLORS.length];
  const isLive = !meeting.isEnded;
  const isReady = meeting.recordingState === "READY";

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      onClick={onClick}
      className="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#f5a623]/7 bg-black/20 px-3.5 py-2.5 text-left transition last:mb-0 hover:border-[#f5a623]/18 hover:bg-black/35"
    >
      <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${gradient} ${textCol} text-[13px] font-extrabold`}>
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#fff5de]">
          {meeting.roomName?.trim() || `Meeting ${meeting.roomId.slice(0, 8)}`}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2.5 text-[11px] text-[#b49650]/60">
          <span className="flex items-center gap-1"><CalendarDays className="size-2.5" />{new Date(meeting.date).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Users className="size-2.5" />{meeting.joinedParticipants.length}</span>
          <span className="flex items-center gap-1"><Clock3 className="size-2.5" />{meeting.recordingState || "Processing"}</span>
        </div>
      </div>
      {isLive ? (
        <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/12 px-2.5 py-0.5 text-[10px] font-bold text-red-400/90">
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-red-400" /> Live
        </span>
      ) : isReady ? (
        <span className="rounded-full border border-green-500/20 bg-green-500/12 px-2.5 py-0.5 text-[10px] font-bold text-green-400/85">Ready</span>
      ) : (
        <span className="rounded-full border border-[#f5a623]/20 bg-[#f5a623]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#f5a623]/80">Processing</span>
      )}
    </motion.button>
  );
}

import { formatDate, formatTime, getDuration } from "./helpers";
import type { Meeting } from "./types";

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "host" | "guest" }) {
  const styles = {
    default: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    host: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    guest: "bg-zinc-700/40 text-zinc-400 border border-zinc-600/30",
  };
  return (
    <span className={`text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function MeetingRow({ meeting, dark }: { meeting: Meeting; dark: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all group cursor-default ${
      dark
        ? "bg-zinc-900/60 border-zinc-800 hover:border-amber-500/25 hover:bg-zinc-900"
        : "bg-white border-zinc-200 hover:border-amber-400/40 hover:bg-zinc-50"
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
          meeting.isHost ? "bg-amber-500/20 text-amber-400" : "bg-zinc-700/40 text-zinc-400"
        }`}>
          {meeting.isHost ? "H" : "G"}
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-semibold truncate ${dark ? "text-white" : "text-zinc-900"}`}>{meeting.roomName}</div>
          <div className={`text-[11px] font-mono ${dark ? "text-zinc-600" : "text-zinc-400"}`}>{meeting.roomId}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <div className={`text-xs font-medium ${dark ? "text-zinc-300" : "text-zinc-600"}`}>{formatDate(meeting.startTime)}</div>
          <div className={`text-[11px] ${dark ? "text-zinc-600" : "text-zinc-400"}`}>
            {formatTime(meeting.startTime)} · {getDuration(meeting.startTime, meeting.endTime)}
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {meeting.joinedParticipants}
        </div>
        <Badge variant={meeting.isHost ? "host" : "guest"}>{meeting.isHost ? "Host" : "Guest"}</Badge>
      </div>
    </div>
  );
}

export function ComingSoonCard({ icon, title, description, dark }: { icon: React.ReactNode; title: string; description: string; dark: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border border-dashed flex flex-col gap-2 transition-colors ${
      dark ? "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-500"}`}>
        {icon}
      </div>
      <div>
        <div className={`text-sm font-semibold flex items-center gap-2 ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
          {title}
          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${dark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-200 text-zinc-400"}`}>Soon</span>
        </div>
        <div className={`text-xs mt-0.5 ${dark ? "text-zinc-600" : "text-zinc-400"}`}>{description}</div>
      </div>
    </div>
  );
}
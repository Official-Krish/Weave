import type { MeetingDetails } from "@repo/types/api";
import { Clock3, Download, LogIn, Plus, Sparkles, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Topbar({
    name,
    liveMeetings,
    meetings,
}: {
    name: string | null;
    liveMeetings: unknown[];
    meetings: MeetingDetails[]
}) {
    const navigate = useNavigate();
    const readyMeetings = meetings.filter((meeting) => meeting.recordingState === "READY");
    const storageGb = (meetings.length * 0.18).toFixed(1);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    return (
        <div className="pt-4">
            <div className="flex items-center justify-between gap-4 pb-8">
                <div>
                    <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#f5a623]/55">{greeting}</p>
                    <h1 className="text-[30px] font-black leading-none tracking-tight text-[#fff5de]">
                    Welcome back, {name ?? "User"}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate("/meetingSetup")}
                        className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/15 bg-white/4 px-4 py-2.5 text-[13px] font-semibold text-[#fff5de]/80 transition hover:border-[#f5a623]/28 cursor-pointer"
                    >
                        <LogIn className="size-3.5" /> Join room
                    </button>
                    <button
                        onClick={() => navigate("/meetingSetup")}
                        className="flex items-center group relative overflow-hidden rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        style={{
                            background: "#F5A623",
                            color: "#0c0c0e",
                        }}
                    >
                        {/* Shimmer sweep */}
                        <span
                            className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                            style={{
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                            }}
                        />
                        <Plus className="size-3.5 mr-1" /> New meeting
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
                { label: "Total meetings", value: meetings.length, icon: <Video className="size-3.5" /> },
                { label: "Live now", value: liveMeetings.length, delta: "Active sessions", live: true, icon: <Clock3 className="size-3.5" /> },
                { label: "Ready to export", value: readyMeetings.length, icon: <Download className="size-3.5" /> },
                { label: "Storage used", value: `${storageGb} GB`, delta: "of 6 GB", warn: true, icon: <Sparkles className="size-3.5" /> },
            ].map(({ label, value, delta, live, warn, icon }) => (
                <div key={label} className="rounded-2xl border border-[#f5a623]/10 bg-white/2.5 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b49650]/60">{label}</p>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[#f5a623]/10 text-[#f5a623]">{icon}</span>
                </div>
                <p className="text-[28px] font-black leading-none tracking-tight text-[#fff5de]">{value}</p>
                <p className={[
                    "mt-1.5 flex items-center gap-1.5 text-[11px]",
                    warn ? "text-red-400/70" : "text-green-400/70",
                ].join(" ")}
                >
                    {live && <span className="inline-block size-1.5 animate-pulse rounded-full bg-red-400" />}
                    {delta}
                </p>
                </div>
            ))}
            </div>
        </div>
    )
}
import { MeetingRow } from "./icons";
import type { Meeting } from "./types";
import { motion } from "motion/react";

export const Meetings = ({
    meetings,
    dark
}: {
    meetings: Meeting[];
    dark: boolean;
}) => {
    return (
        <motion.div className={`rounded-[24px] border p-5 transition-colors shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${
            dark ? "border-white/8 bg-white/[0.03]" : "bg-white border-zinc-200"
        }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>All Meetings</div>
            {meetings.length === 0 ? (
                <div className={`rounded-2xl border py-10 text-center text-sm ${dark ? "border-white/8 bg-black/20 text-zinc-600" : "text-zinc-400"}`}>No meetings yet.</div>
                ) : (
                <div className="space-y-2">
                    {meetings.map((m) => (
                        <MeetingRow key={m.roomId} meeting={m} dark={dark} />
                    ))}
                </div>
            )}
        </motion.div>
    )
}

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
        <motion.div className={`rounded-2xl border p-4 transition-colors ${
            dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`text-xs uppercase tracking-widest font-semibold mb-3 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>All Meetings</div>
            {meetings.length === 0 ? (
                <div className={`text-center py-8 text-sm ${dark ? "text-zinc-600" : "text-zinc-400"}`}>No meetings yet.</div>
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
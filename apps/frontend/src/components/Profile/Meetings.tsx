import { MeetingRow } from "./icons";
import type { Meeting } from "./types";

export const Meetings = ({
    meetings,
    dark
}: {
    meetings: Meeting[];
    dark: boolean;
}) => {
    return (
        <div className={`rounded-2xl border p-4 transition-colors ${
            dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
        }`}>
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
        </div>
    )
}
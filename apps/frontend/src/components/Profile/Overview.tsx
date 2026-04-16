import { formatDate } from "./helpers";
import { MeetingRow } from "./icons";
import type { User } from "./types";
import { motion } from "motion/react";

export const Overview = ({
    user,
    setActiveTab,
    dark
}: {
    user: User;
    setActiveTab: (tab: "overview" | "meetings" | "billing" | "integrations") => void;
    dark: boolean;
}) => {
    return (
        <motion.div className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`rounded-2xl border p-4 transition-colors ${ dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <div className={`text-xs uppercase tracking-widest font-semibold mb-3 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Recent Meetings</div>
                <div className="space-y-2">
                    {user.meetings.slice(0, 2).map((m) => (
                        <MeetingRow key={m.roomId} meeting={m} dark={dark} />
                    ))}
                </div>
                <button
                    onClick={() => setActiveTab("meetings")}
                    className={`mt-3 text-xs font-semibold transition-colors cursor-pointer ${dark ? "text-amber-500 hover:text-amber-400" : "text-amber-600 hover:text-amber-500 "}`}
                >
                    View all meetings →
                </button>
            </div>

            {/* Account info */}
            <div className={`rounded-2xl border p-4 transition-colors ${ dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            }`}>
                <div className={`text-xs uppercase tracking-widest font-semibold mb-3 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Account</div>
                <div className="space-y-2">
                    {[
                    { label: "Member since", value: formatDate(user.createdAt) },
                    { label: "Last updated", value: formatDate(user.updatedAt) },
                    { label: "Encryption", value: "AES-128" },
                    ].map(({ label, value }) => (
                        <div key={label} className={`flex justify-between items-center py-1.5 border-b last:border-0 ${dark ? "border-zinc-800" : "border-zinc-100"}`}>
                            <span className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>{label}</span>
                            <span className={`text-xs font-medium ${dark ? "text-zinc-300" : "text-zinc-700"}`}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
import { ComingSoonCard } from "./icons"
import { motion } from "motion/react"

export const Integerations = ({ dark }: { dark: boolean}) => {
    return (
        <motion.div className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="grid grid-cols-2 gap-3">
                <ComingSoonCard
                    dark={dark}
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                    title="Google Calendar"
                    description="Auto-schedule and join meetings from your calendar"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                    title="Slack"
                    description="Get recording notifications and share instantly"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                    title="Zapier"
                    description="Automate workflows with 5000+ apps"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                    title="Notion"
                    description="Save meeting notes and transcripts to Notion"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>}
                    title="Zoom Import"
                    description="Import recordings from Zoom to Weave"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
                    title="Webhooks"
                    description="Get real-time events sent to your endpoints"
                />
            </div>
            <div className={`rounded-[24px] border p-5 text-center transition-colors shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${ dark ? "border-white/8 bg-white/[0.03]" : "bg-zinc-50 border-zinc-200" }`}>
                <div className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                    Want a specific integration?{" "}
                    <span className={`cursor-pointer font-semibold ${dark ? "text-amber-300 hover:text-amber-200" : "text-amber-600"}`}>Request it →</span>
                </div>
            </div>
        </motion.div>
    )
}

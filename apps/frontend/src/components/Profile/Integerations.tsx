import { ComingSoonCard } from "./icons"
import { motion } from "motion/react"
import { SiGooglecalendar, SiZapier } from "react-icons/si";
import { FaSlack, FaShareAlt } from "react-icons/fa";
import { RiNotionFill } from "react-icons/ri";
import { BiLogoZoom } from "react-icons/bi";

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
                    icon={<SiGooglecalendar className="w-7 h-7" />}
                    title="Google Calendar"
                    description="Auto-schedule and join meetings from your calendar"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<FaSlack className="w-7 h-7" />}
                    title="Slack"
                    description="Get recording notifications and share instantly"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<SiZapier className="w-7 h-7" />}
                    title="Zapier"
                    description="Automate workflows with 5000+ apps"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<RiNotionFill className="w-7 h-7" />}
                    title="Notion"
                    description="Save meeting notes and transcripts to Notion"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<BiLogoZoom className="w-7 h-7" />}
                    title="Zoom Import"
                    description="Import recordings from Zoom to Weave"
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<FaShareAlt className="w-6 h-6" />}
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

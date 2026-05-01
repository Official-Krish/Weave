import { ComingSoonCard, IntegerationCard } from "./icons"
import { motion } from "motion/react"
import { SiDiscord, SiGmail, SiGooglecalendar } from "react-icons/si";
import { FaSlack, FaGithub } from "react-icons/fa";
import { RiNotionFill } from "react-icons/ri";

export const Integerations = ({ dark, googleId, githubUsername }: { dark: boolean, googleId: string | null, githubUsername: string | null }) => {
    return (
        <motion.div className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="grid grid-cols-2 gap-3">
                <IntegerationCard
                    id="google-calendar-integration"
                    dark={dark}
                    icon={<SiGooglecalendar className="w-7 h-7" />}
                    title="Google Calendar"
                    description="Auto-schedule and join meetings from your calendar"
                    connected={googleId !== null}
                />
                <IntegerationCard
                    id="gmail-integration"
                    dark={dark}
                    icon={<SiGmail className="w-7 h-7" />}
                    title="Gmail"
                    description="Get Meeting invites and recording notifications right in your inbox"
                />
                <IntegerationCard
                    id="slack-integration"
                    dark={dark}
                    icon={<FaSlack className="w-7 h-7" />}
                    title="Slack"
                    description="Get recording notifications and share instantly"
                />
                <IntegerationCard
                    id="discord-integration"
                    dark={dark}
                    icon={<SiDiscord className="w-7 h-7" />}
                    title="Discord"
                    description="Get recording notifications and share instantly"
                />
                <IntegerationCard
                    id="github-integration"
                    dark={dark}
                    icon={<FaGithub className="w-7 h-7" />}
                    title="GitHub"
                    description="Turn meeting discussions into GitHub issues instantly. Collaborate, assign, and track work without leaving your call."
                    connected={githubUsername !== null}
                />
                <ComingSoonCard
                    dark={dark}
                    icon={<RiNotionFill className="w-7 h-7" />}
                    title="Notion"
                    description="Export meeting notes, action items, and summaries directly to Notion. Keep your team aligned and organized effortlessly."
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

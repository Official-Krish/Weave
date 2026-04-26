import { Bell, CheckCircle2, Hash, Mail, Webhook, AtSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { circOut, circIn } from "framer-motion";
import { NOTIFICATION_OPTIONS, type NotificationSelectorProps } from "./utils";

const fadeSlide = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: circOut } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: circIn } },
};

export function NotificationSelector({
  notificationType,
  setNotificationType,
  slackBotToken,
  setSlackBotToken,
  slackUserId,
  setSlackUserId,
  discordWebhookUrl,
  setDiscordWebhookUrl,
}: NotificationSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="size-3.5 text-[#f5a623]/70" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b49650]/75">
          Notify via
        </p>
      </div>

      {/* Channel pills */}
      <div className="flex flex-wrap gap-2">
        {NOTIFICATION_OPTIONS.map((opt) => {
          const isSelected = notificationType === opt.id;
          return (
            <button
              key={String(opt.id)}
              type="button"
              onClick={() => setNotificationType(opt.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? "border-[#f5a623]/50 bg-[#f5a623]/12 text-[#ffd166]"
                    : "border-white/10 bg-white/4 text-[#fff5de]/60 hover:border-white/20 hover:text-[#fff5de]/90"
                }`}
            >
              <span className={isSelected ? "text-[#f5a623]" : "text-[#b49650]/60"}>
                {opt.icon}
              </span>
              {opt.label}
              {isSelected && <CheckCircle2 className="size-3.5 text-[#f5a623]" />}
            </button>
          );
        })}
      </div>

      {/* Credentials panel */}
      <AnimatePresence mode="wait">
        {notificationType === "GMAIL" && (
          <motion.div
            key="gmail"
            variants={fadeSlide}
            initial="hidden"
            animate="show"
            exit="exit"
            className="rounded-2xl border border-[#ea4335]/20 bg-[#ea4335]/5 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Mail className="size-4 text-[#ea4335]" />
              <p className="text-sm font-bold text-[#fff5de]">Gmail notification</p>
            </div>
            <p className="text-xs text-[#b49650]/65 leading-5">
              Each invitee will receive a branded email invitation via Weave's mail service. No extra credentials required.
            </p>
          </motion.div>
        )}

        {notificationType === "SLACK" && (
          <motion.div
            key="slack"
            variants={fadeSlide}
            initial="hidden"
            animate="show"
            exit="exit"
            className="rounded-2xl border border-[#4a154b]/40 bg-[#4a154b]/10 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Hash className="size-4 text-[#9b59b6]" />
              <p className="text-sm font-bold text-[#fff5de]">Slack credentials</p>
            </div>
            <p className="text-xs text-[#b49650]/65 leading-5">
              Your bot will send a DM to the target user. The bot must already be in the workspace.
            </p>
            <div className="space-y-2.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b49650]/60">
                  Bot Token
                </label>
                <input
                  value={slackBotToken}
                  onChange={(e) => setSlackBotToken(e.target.value)}
                  placeholder="xoxb-..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/4 px-3 font-mono text-xs text-[#fff5de] outline-none transition focus:border-[#9b59b6]/50 focus:ring-2 focus:ring-[#9b59b6]/15"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b49650]/60">
                  Slack User ID
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#b49650]/40 pointer-events-none" />
                  <input
                    value={slackUserId}
                    onChange={(e) => setSlackUserId(e.target.value)}
                    placeholder="U0123456789"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/4 pl-8 pr-3 font-mono text-xs text-[#fff5de] outline-none transition focus:border-[#9b59b6]/50 focus:ring-2 focus:ring-[#9b59b6]/15"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {notificationType === "DISCORD" && (
          <motion.div
            key="discord"
            variants={fadeSlide}
            initial="hidden"
            animate="show"
            exit="exit"
            className="rounded-2xl border border-[#5865f2]/30 bg-[#5865f2]/8 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Webhook className="size-4 text-[#5865f2]" />
              <p className="text-sm font-bold text-[#fff5de]">Discord webhook</p>
            </div>
            <p className="text-xs text-[#b49650]/65 leading-5">
              Paste a Discord channel webhook URL. The bot will post a rich embed card with all meeting details.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b49650]/60">
                Webhook URL
              </label>
              <input
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/4 px-3 font-mono text-xs text-[#fff5de] outline-none transition focus:border-[#5865f2]/50 focus:ring-2 focus:ring-[#5865f2]/15"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

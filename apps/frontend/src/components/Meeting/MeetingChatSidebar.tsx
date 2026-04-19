import { MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChatMessage } from "../../hooks/useMeetingRealtime";

type MeetingChatSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: RealtimeChatMessage[];
  typingNames: string[];
  selfName?: string;
  participants?: { name: string; color: string }[];
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
};

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const AVATAR_GRADIENTS = [
  "from-[#ffcf6b] to-[#f5a623]",
  "from-[#85b7eb] to-[#378add]",
  "from-[#97c459] to-[#639922]",
  "from-[#afa9ec] to-[#7f77dd]",
  "from-[#f0997b] to-[#d85a30]",
];
const AVATAR_TEXT = [
  "text-[#1b1100]", "text-[#042c53]", "text-[#173404]",
  "text-[#26215c]", "text-[#4a1b0c]",
];

function senderIndex(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h % AVATAR_GRADIENTS.length;
}

function SenderAvatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const i = senderIndex(name);
  const dim = size === "sm" ? "size-6 text-[10px]" : "size-8 text-[12px]";
  return (
    <span className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full bg-linear-to-br ${AVATAR_GRADIENTS[i]} ${AVATAR_TEXT[i]} font-extrabold`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function MeetingChatSidebar({
  isOpen, onClose, messages, typingNames,
  selfName,
  participants = [], onSendMessage, onTyping,
}: MeetingChatSidebarProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const typingLabel = useMemo(() => {
    if (typingNames.length === 0) return "";
    if (typingNames.length === 1) return `${typingNames[0]} is typing…`;
    return `${typingNames[0]} and others are typing…`;
  }, [typingNames]);

  const send = () => {
    const val = draft.trim();
    if (!val) return;
    onSendMessage(val);
    onTyping(false);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeInOut" }}
          className="fixed bottom-0 right-0 top-0 z-50 flex w-75 flex-col border-l border-[#f5a623]/12 bg-[#0d0b08]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#f5a623]/10 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#f5a623]/10">
                <MessageSquare className="size-3.5 text-[#f5a623]" />
              </span>
              <span className="text-[13px] font-bold text-[#fff5de]">Meeting chat</span>
            </div>
            <div className="flex items-center gap-2">
              {participants.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-[#f5a623]/15 bg-[#f5a623]/8 px-2 py-1">
                  <span className="size-1.5 rounded-full bg-[#f5a623]" />
                  <span className="text-[10px] font-bold text-[#f5a623]/75">{participants.length} online</span>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-lg border border-white/8 bg-white/4 transition hover:bg-white/8"
              >
                <X className="size-3.5 text-[#c8a870]/70" />
              </button>
            </div>
          </div>

          {/* Participant strip */}
          {participants.length > 0 && (
            <div className="flex shrink-0 items-center gap-2.5 border-b border-[#f5a623]/7 bg-black/15 px-4 py-2">
              <div className="flex">
                {participants.slice(0, 5).map((p, i) => (
                  <span
                    key={p.name}
                    className={`inline-flex size-5.5 items-center justify-center rounded-full border-[1.5px] border-[#0d0b08] bg-linear-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} ${AVATAR_TEXT[i % AVATAR_TEXT.length]} text-[8px] font-extrabold`}
                    style={{ marginLeft: i === 0 ? 0 : -5 }}
                    title={p.name}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-[#c8a870]/50 truncate">
                {participants.map((p) => p.name).join(", ")}
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3 [scrollbar-color:rgba(245,166,35,0.1)_transparent] [scrollbar-width:thin]">
            {messages.length === 0 && (
              <p className="rounded-xl border border-[#f5a623]/10 bg-[#f5a623]/5 px-3.5 py-3 text-[12px] text-[#c8a870]/60">
                No messages yet. Say hello to your team.
              </p>
            )}

            {messages.map((msg, i) => {
              const systemMessage = msg as RealtimeChatMessage & { isSystem?: boolean };
              const normalizedSelfName = (selfName || "").trim().toLowerCase();
              const isOwnMessage =
                msg.isOwn ||
                (normalizedSelfName.length > 0 &&
                  msg.senderName.trim().toLowerCase() === normalizedSelfName);
              const prevSame =
                i > 0 &&
                messages[i - 1].senderName === msg.senderName &&
                !(messages[i - 1] as RealtimeChatMessage & { isSystem?: boolean }).isSystem;
              const isSystem = Boolean(systemMessage.isSystem);

              if (isSystem) {
                return (
                  <p key={msg.id} className="py-1 text-center text-[10px] text-[#b49650]/40">
                    {msg.text}
                  </p>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={["flex w-full flex-col gap-0.5", isOwnMessage ? "items-end" : "items-start"].join(" ")}
                >
                  {isOwnMessage ? (
                    !prevSame && (
                      <div className="mb-0.5 flex w-full justify-end gap-1.5 pr-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5c050]/55">You</span>
                        <span className="text-[11px] text-[#b49650]/35">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                    )
                  ) : (
                    !prevSame && (
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <SenderAvatar name={msg.senderName} size="lg" />
                        <span className="text-[12px] font-bold tracking-wide text-[#c8a870]/65">{msg.senderName}</span>
                        <span className="text-[11px] text-neutral-600">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                    )
                  )}

                  <div
                    className={[
                      "max-w-[84%] px-3.5 py-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.12)]",
                      isOwnMessage
                        ? "rounded-[18px] rounded-br-md border border-[#f5a623]/20 bg-linear-to-br from-[#6f4815] via-[#53340f] to-[#3c250a]"
                        : "rounded-[18px] rounded-bl-md border border-white/7 bg-white/4",
                    ].join(" ")}
                  >
                    <p className="text-[13px] leading-relaxed text-[#fff5de]">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Typing indicator */}
          <div className="shrink-0 px-3 py-1.5" style={{ minHeight: 24 }}>
            {typingLabel && (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block size-1 rounded-full bg-[#f5a623]/50"
                      style={{ animation: `bounce 1.2s ease ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-[#c8a870]/50">{typingLabel}</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-[#f5a623]/10 bg-black/20 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                placeholder="Message the room…"
                onChange={(e) => {
                  setDraft(e.target.value);
                  onTyping(e.target.value.trim().length > 0);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                className="flex-1 resize-none overflow-hidden rounded-2xl border border-white/8 bg-white/4 px-3.5 py-2.5 text-[13px] text-[#fff5de] outline-none transition placeholder:text-[#c8a870]/30 focus:border-[#f5a623]/35 focus:bg-[#f5a623]/2.5"
                style={{ minHeight: 38, maxHeight: 80, lineHeight: "1.4" }}
              />
              <button
                type="button"
                onClick={send}
                disabled={!draft.trim()}
                className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#ffcf6b] via-[#f5a623] to-[#d98a10] text-[#1b1100] transition hover:opacity-90 active:scale-95 disabled:opacity-35"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-[#b49650]/30">Enter to send · Shift+Enter for new line</p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

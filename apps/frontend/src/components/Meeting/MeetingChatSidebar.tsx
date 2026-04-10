import { MessageSquare, Send, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { RealtimeChatMessage } from "../../hooks/useMeetingRealtime";

type MeetingChatSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: RealtimeChatMessage[];
  typingNames: string[];
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
};

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MeetingChatSidebar({
  isOpen,
  onClose,
  messages,
  typingNames,
  onSendMessage,
  onTyping,
}: MeetingChatSidebarProps) {
  const [draft, setDraft] = useState("");

  const typingLabel = useMemo(() => {
    if (typingNames.length === 0) {
      return "";
    }

    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    }

    return `${typingNames[0]} and others are typing...`;
  }, [typingNames]);

  if (!isOpen) {
    return null;
  }

  return (
    <motion.aside
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="fixed bottom-0 right-0 top-0 z-50 flex w-80 flex-col border-l border-[#2b3c47] bg-[#0b1218]/95 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-[#263742] px-4 py-4">
        <h2 className="flex items-center gap-2 text-sm font-medium text-[#e5eef4]">
          <MessageSquare size={15} />
          Chat
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[#8ca4b4] transition hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="rounded-lg border border-[#233744] bg-[#0f1b23]/60 p-3 text-xs text-[#9ab2c2]">
            No messages yet. Say hello to your team.
          </p>
        ) : null}

        {messages.map((message) => (
          <div key={message.id} className={message.isOwn ? "flex justify-end" : "flex justify-start"}>
            <div
              className={[
                "max-w-[85%] rounded-xl px-3 py-2",
                message.isOwn ? "bg-[#1f4258] text-[#e5f6ff]" : "bg-[#12222d] text-[#dce9f1]",
              ].join(" ")}
            >
              {!message.isOwn ? (
                <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[#8eb5cb]">
                  {message.senderName}
                </p>
              ) : null}
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className="mt-1 text-right text-[10px] text-[#8aa6b8]">{formatTimestamp(message.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#263742] px-3 py-2">
        <p className="min-h-4 text-[10px] text-[#84a5b9]">{typingLabel}</p>
        <form
          className="mt-1 flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const value = draft.trim();
            if (!value) {
              return;
            }
            onSendMessage(value);
            onTyping(false);
            setDraft("");
          }}
        >
          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              onTyping(event.target.value.trim().length > 0);
            }}
            placeholder="Type a message"
            className="h-10 flex-1 rounded-full border border-[#2b4452] bg-[#091218] px-4 text-sm text-[#e3eef5] outline-none transition placeholder:text-[#6f8b9d] focus:border-[#4f7286]"
          />
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e556c] text-[#dff3ff] transition hover:bg-[#3c6781]"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </motion.aside>
  );
}
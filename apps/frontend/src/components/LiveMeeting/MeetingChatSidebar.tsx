import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CircleDot,
  FolderGit2,
  GitBranch,
  ListTodo,
  MessageCircleMore,
  MessageSquare,
  PlusCircle,
  Tag,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { http } from "../../https";
import type { RealtimeChatMessage } from "../../hooks/useMeetingRealtime";
import IssueActionsModal from "./IssueActionsModal";
import IssueCreateModal from "./IssueCreateModal";

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

type RepoItem = {
  full_name: string;
};

type CommandItem = {
  id: string;
  cmd: string;
  title: string;
  description: string;
  example: string;
  group: string;
  icon: typeof PlusCircle;
};

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AVATAR_GRADIENTS = [
  "from-[#ffcf6b] to-[#f5a623]",
  "from-[#85b7eb] to-[#378add]",
  "from-[#97c459] to-[#639922]",
  "from-[#afa9ec] to-[#7f77dd]",
  "from-[#f0997b] to-[#d85a30]",
];
const AVATAR_TEXT = [
  "text-[#1b1100]",
  "text-[#042c53]",
  "text-[#173404]",
  "text-[#26215c]",
  "text-[#4a1b0c]",
];

const COMMAND_ITEMS: CommandItem[] = [
  {
    id: "createissue",
    cmd: "/createissue",
    title: "Create issue",
    description: "Open a form for a new GitHub issue in the connected repo.",
    example: "/createissue Login button is broken on Safari",
    group: "Create",
    icon: PlusCircle,
  },
  {
    id: "listissues",
    cmd: "/listissues",
    title: "Browse issues",
    description:
      "See open issues for the connected repo and take actions from one place.",
    example: "/listissues",
    group: "Browse",
    icon: ListTodo,
  },
  {
    id: "commentissue",
    cmd: "/commentissue",
    title: "Comment on issue",
    description:
      "Open issue actions and add a comment without leaving the meeting.",
    example: "/commentissue",
    group: "Update",
    icon: MessageCircleMore,
  },
  {
    id: "closeissue",
    cmd: "/closeissue",
    title: "Close issue",
    description: "Open issue actions and close an issue when the work is done.",
    example: "/closeissue",
    group: "Update",
    icon: CircleDot,
  },
  {
    id: "assignissue",
    cmd: "/assignissue",
    title: "Assign issue",
    description:
      "Open issue actions and assign teammates to the selected issue.",
    example: "/assignissue",
    group: "Update",
    icon: UserPlus,
  },
  {
    id: "createlabel",
    cmd: "/createlabel",
    title: "Add labels",
    description: "Open issue actions and add labels like bug, ux, or urgent.",
    example: "/createlabel",
    group: "Update",
    icon: Tag,
  },
];

function senderIndex(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return h % AVATAR_GRADIENTS.length;
}

function SenderAvatar({
  name,
  size = "lg",
}: {
  name: string;
  size?: "sm" | "lg";
}) {
  const i = senderIndex(name);
  const dim = size === "sm" ? "size-6 text-[10px]" : "size-8 text-[12px]";
  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full bg-linear-to-br ${AVATAR_GRADIENTS[i]} ${AVATAR_TEXT[i]} font-extrabold`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function getCommandFromDraft(draft: string) {
  const trimmed = draft.trim();
  return COMMAND_ITEMS.find((item) =>
    new RegExp(`^\\${item.cmd}(?:\\s|$)`).test(trimmed),
  );
}

export function MeetingChatSidebar({
  isOpen,
  onClose,
  messages,
  typingNames,
  selfName,
  participants = [],
  onSendMessage,
  onTyping,
}: MeetingChatSidebarProps) {
  const [draft, setDraft] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issuePrefillTitle, setIssuePrefillTitle] = useState<
    string | undefined
  >(undefined);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [actionsPrefill, setActionsPrefill] = useState<string | undefined>(
    undefined,
  );
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const reposQuery = useQuery<RepoItem[]>({
    queryKey: ["github", "repos"],
    queryFn: async () => {
      const res = await http.get("/github/repos");
      return res.data.githubRepos || res.data.repos || [];
    },
    enabled: isOpen,
    retry: false,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || selectedRepo || !reposQuery.data?.length) return;
    setSelectedRepo(reposQuery.data[0].full_name);
  }, [isOpen, reposQuery.data, selectedRepo]);

  const typingLabel = useMemo(() => {
    if (typingNames.length === 0) return "";
    if (typingNames.length === 1) return `${typingNames[0]} is typing…`;
    return `${typingNames[0]} and others are typing…`;
  }, [typingNames]);

  const commandQuery = draft.trim().startsWith("/")
    ? draft.trim().slice(1).toLowerCase()
    : "";

  const filteredCommands = useMemo(() => {
    if (!commandQuery) {
      return COMMAND_ITEMS;
    }

    return COMMAND_ITEMS.filter((item) => {
      const haystack = [
        item.cmd,
        item.title,
        item.description,
        item.group,
      ].join(" ");

      return haystack.toLowerCase().includes(commandQuery);
    });
  }, [commandQuery]);

  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce<Record<string, CommandItem[]>>(
      (acc, item) => {
        if (!acc[item.group]) {
          acc[item.group] = [];
        }

        acc[item.group].push(item);
        return acc;
      },
      {},
    );
  }, [filteredCommands]);

  useEffect(() => {
    if (!showCommandPalette) return;
    setActiveCommandIndex((index) =>
      Math.min(index, Math.max(filteredCommands.length - 1, 0)),
    );
  }, [filteredCommands.length, showCommandPalette]);

  const send = () => {
    const val = draft.trim();
    if (!val) return;
    onSendMessage(val);
    onTyping(false);
    setDraft("");
    setShowCommandPalette(false);
    inputRef.current?.focus();
  };

  const openCommand = (command: CommandItem) => {
    if (command.id === "createissue") {
      const remainder = draft
        .trim()
        .replace(/^\/createissue(?:\s|$)/, "")
        .trim();
      setIssuePrefillTitle(remainder || undefined);
      setShowIssueModal(true);
    } else {
      setActionsPrefill(selectedRepo || undefined);
      setShowActionsModal(true);
    }

    setDraft("");
    setShowCommandPalette(false);
    onTyping(false);
  };

  const submitDraft = () => {
    const matchedCommand = getCommandFromDraft(draft);
    if (matchedCommand) {
      openCommand(matchedCommand);
      return;
    }

    send();
  };

  const activeCommand = filteredCommands[activeCommandIndex] || null;
  const hasRepoAccess = Boolean(reposQuery.data && reposQuery.data.length > 0);
  const githubStatus = reposQuery.isLoading
    ? {
        label: "Checking GitHub",
        className: "border-[#f5a623]/18 bg-[#f5a623]/10 text-[#ffe0a8]",
      }
    : reposQuery.isError
      ? {
          label: "GitHub unavailable",
          className: "border-red-400/18 bg-red-500/10 text-red-200",
        }
      : hasRepoAccess
        ? {
            label: "GitHub ready",
            className:
              "border-emerald-400/18 bg-emerald-400/10 text-emerald-200",
          }
        : {
            label: "No repo access",
            className: "border-[#f5a623]/18 bg-[#f5a623]/10 text-[#ffe0a8]",
          };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeInOut" }}
          className="fixed bottom-0 right-0 top-0 z-50 flex w-[420px] max-w-[96vw] flex-col border-l border-[#f5a623]/12 bg-[linear-gradient(180deg,#110d09_0%,#080705_100%)]"
        >
          <div className="border-b border-[#f5a623]/10 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-2xl border border-[#f5a623]/12 bg-[#f5a623]/10">
                  <MessageSquare className="size-4 text-[#f5a623]" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#fff5de]">
                    Meeting chat
                  </p>
                  <p className="text-[11px] text-[#b89a63]">
                    Team notes and GitHub actions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-xl border border-white/8 bg-white/4 transition hover:bg-white/8"
              >
                <X className="size-4 text-[#c8a870]/70" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${githubStatus.className}`}
              >
                <GitBranch className="h-3.5 w-3.5" />
                {githubStatus.label}
              </span>
              {participants.length > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] text-[#d8c198]">
                  {participants.length} online
                </span>
              ) : null}
            </div>

            <div className="mt-3 rounded-2xl border border-[#f5a623]/12 bg-[#120f0b] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9f8251]">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    Active repo
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-[#fff5de]">
                    {selectedRepo ||
                      (reposQuery.isError
                        ? "Connect GitHub in profile"
                        : "No repo selected")}
                  </p>
                </div>
                {reposQuery.data && reposQuery.data.length > 1 ? (
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="max-w-40 rounded-xl border border-white/10 bg-black/30 px-2.5 py-2 text-xs text-[#fff5de] outline-none focus:border-[#f5a623]/40"
                  >
                    {reposQuery.data.map((repo) => (
                      <option key={repo.full_name} value={repo.full_name}>
                        {repo.full_name}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>

              <p className="mt-2 text-[12px] leading-relaxed text-[#cbb38a]">
                {reposQuery.isError
                  ? "GitHub commands need an active GitHub connection before the issue forms can open."
                  : "Slash commands in this room act on the repo shown here. You can switch it before creating or updating issues."}
              </p>
            </div>
          </div>

          {participants.length > 0 && (
            <div className="flex shrink-0 items-center gap-2.5 border-b border-[#f5a623]/7 bg-black/15 px-4 py-2.5">
              <div className="flex">
                {participants.slice(0, 5).map((p, i) => (
                  <span
                    key={p.name}
                    className={`inline-flex size-6 items-center justify-center rounded-full border-[1.5px] border-[#0d0b08] bg-linear-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} ${AVATAR_TEXT[i % AVATAR_TEXT.length]} text-[9px] font-extrabold`}
                    style={{ marginLeft: i === 0 ? 0 : -6 }}
                    title={p.name}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                ))}
              </div>
              <span className="truncate text-[11px] text-[#c8a870]/55">
                {participants.map((p) => p.name).join(", ")}
              </span>
            </div>
          )}

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 [scrollbar-color:rgba(245,166,35,0.1)_transparent] [scrollbar-width:thin]">
            {messages.length === 0 ? (
              <div className="rounded-[28px] border border-[#f5a623]/12 bg-[radial-gradient(circle_at_top,rgba(245,166,35,0.12),transparent_45%),linear-gradient(180deg,rgba(31,23,14,0.9),rgba(13,10,7,0.94))] px-5 py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f5a623]/16 bg-[#f5a623]/10">
                  <GitBranch className="h-7 w-7 text-[#f5c050]" />
                </div>
                <p className="mt-4 text-base font-semibold text-[#fff5de]">
                  Start the conversation or open an issue together
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#ccb48b]">
                  Type <span className="font-semibold text-[#fff0cc]">/</span>{" "}
                  to browse GitHub commands, capture bugs from the meeting, or
                  assign follow-up work without leaving the call.
                </p>
              </div>
            ) : null}

            {messages.map((msg, i) => {
              const systemMessage = msg as RealtimeChatMessage & {
                isSystem?: boolean;
              };
              const normalizedSelfName = (selfName || "").trim().toLowerCase();
              const isOwnMessage =
                msg.isOwn ||
                (normalizedSelfName.length > 0 &&
                  msg.senderName.trim().toLowerCase() === normalizedSelfName);
              const prevSame =
                i > 0 &&
                messages[i - 1].senderName === msg.senderName &&
                !(
                  messages[i - 1] as RealtimeChatMessage & {
                    isSystem?: boolean;
                  }
                ).isSystem;
              const isSystem = Boolean(systemMessage.isSystem);

              if (isSystem) {
                return (
                  <p
                    key={msg.id}
                    className="rounded-full bg-white/4 px-3 py-1 text-center text-[10px] text-[#b49650]/50"
                  >
                    {msg.text}
                  </p>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={[
                    "flex w-full flex-col gap-0.5",
                    isOwnMessage ? "items-end" : "items-start",
                  ].join(" ")}
                >
                  {isOwnMessage
                    ? !prevSame && (
                        <div className="mb-1 flex w-full justify-end gap-1.5 pr-1">
                          <span className="rounded-full border border-[#f5a623]/14 bg-[#f5a623]/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f5c050]/65">
                            You
                          </span>
                          <span className="pt-1 text-[11px] text-[#b49650]/35">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                      )
                    : !prevSame && (
                        <div className="mb-1 flex items-center gap-2">
                          <SenderAvatar name={msg.senderName} size="lg" />
                          <span className="text-[12px] font-bold tracking-wide text-[#c8a870]/65">
                            {msg.senderName}
                          </span>
                          <span className="text-[11px] text-neutral-600">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                      )}

                  <div
                    className={[
                      "max-w-[84%] rounded-[22px] px-3.5 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.12)]",
                      isOwnMessage
                        ? "rounded-br-md border border-[#f5a623]/20 bg-linear-to-br from-[#6f4815] via-[#53340f] to-[#3c250a]"
                        : "rounded-bl-md border border-white/7 bg-white/4",
                    ].join(" ")}
                  >
                    <p className="text-[13px] leading-relaxed text-[#fff5de]">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 px-4 py-1.5" style={{ minHeight: 24 }}>
            {typingLabel && (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block size-1 rounded-full bg-[#f5a623]/50"
                      style={{
                        animation: `bounce 1.2s ease ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-[#c8a870]/50">
                  {typingLabel}
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[#f5a623]/10 bg-black/20 px-4 py-4">
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-2">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  placeholder="Message the room or type / for GitHub commands"
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setDraft(nextValue);
                    onTyping(nextValue.trim().length > 0);
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 112) + "px";
                    setShowCommandPalette(nextValue.trim().startsWith("/"));
                  }}
                  onKeyDown={(e) => {
                    if (
                      showCommandPalette &&
                      filteredCommands.length > 0 &&
                      e.key === "ArrowDown"
                    ) {
                      e.preventDefault();
                      setActiveCommandIndex((index) =>
                        Math.min(index + 1, filteredCommands.length - 1),
                      );
                      return;
                    }

                    if (
                      showCommandPalette &&
                      filteredCommands.length > 0 &&
                      e.key === "ArrowUp"
                    ) {
                      e.preventDefault();
                      setActiveCommandIndex((index) => Math.max(index - 1, 0));
                      return;
                    }

                    if (
                      showCommandPalette &&
                      filteredCommands.length > 0 &&
                      e.key === "Tab"
                    ) {
                      e.preventDefault();
                      setDraft(`${filteredCommands[activeCommandIndex]?.cmd} `);
                      return;
                    }

                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();

                      if (showCommandPalette && filteredCommands.length > 0) {
                        openCommand(filteredCommands[activeCommandIndex]);
                        return;
                      }

                      submitDraft();
                    }
                  }}
                  className="flex-1 resize-none overflow-hidden bg-transparent px-3.5 py-2.5 text-[13px] text-[#fff5de] outline-none transition placeholder:text-[#c8a870]/30"
                  style={{ minHeight: 42, maxHeight: 112, lineHeight: "1.45" }}
                />
                <button
                  type="button"
                  onClick={submitDraft}
                  disabled={!draft.trim()}
                  className="mb-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#ffcf6b] via-[#f5a623] to-[#d98a10] text-[#1b1100] transition hover:opacity-90 active:scale-95 disabled:opacity-35"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>

              {showCommandPalette ? (
                <div className="mt-2 rounded-[20px] border border-[#f5a623]/10 bg-[#0b0a08] p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9f8251]">
                      Slash commands
                    </p>
                    <p className="text-[11px] text-[#b89a63]">Enter to open</p>
                  </div>

                  <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                    {Object.entries(groupedCommands).map(([group, items]) => (
                      <div key={group}>
                        <p className="px-2 pb-1 text-[11px] font-semibold text-[#d3b783]">
                          {group}
                        </p>
                        <div className="space-y-1">
                          {items.map((item) => {
                            const globalIndex = filteredCommands.findIndex(
                              (command) => command.id === item.id,
                            );
                            const isActive = activeCommandIndex === globalIndex;
                            const Icon = item.icon;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onMouseEnter={() =>
                                  setActiveCommandIndex(globalIndex)
                                }
                                onClick={() => openCommand(item)}
                                className={[
                                  "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
                                  isActive
                                    ? "border-[#f5a623]/22 bg-[#f5a623]/10"
                                    : "border-transparent bg-transparent hover:border-white/8 hover:bg-white/4",
                                ].join(" ")}
                              >
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl border border-[#f5a623]/12 bg-[#f5a623]/10 text-[#f5c050]">
                                  <Icon className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-[#fff5de]">
                                      {item.title}
                                    </span>
                                    <span className="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[11px] text-[#d9c39d]">
                                      {item.cmd}
                                    </span>
                                  </span>
                                  <span className="mt-1 block text-[12px] leading-relaxed text-[#cbb38a]">
                                    {item.description}
                                  </span>
                                  <span className="mt-1 block text-[11px] text-[#9f8251]">
                                    Example: {item.example}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {filteredCommands.length === 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/3 px-3 py-4 text-sm text-[#cbb38a]">
                        No matching command. Try{" "}
                        <span className="text-[#fff5de]">/createissue</span> or{" "}
                        <span className="text-[#fff5de]">/listissues</span>.
                      </div>
                    ) : null}
                  </div>

                  {activeCommand ? (
                    <div className="mt-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-2.5 text-[12px] text-[#d7c29c]">
                      Target repo:{" "}
                      <span className="font-semibold text-[#fff5de]">
                        {selectedRepo || "Choose a connected repo"}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 py-1 text-[11px] text-[#b49650]/40">
                  <span>Enter to send · Shift+Enter for new line</span>
                  <span>Type / to open GitHub commands</span>
                </div>
              )}
            </div>
          </div>

          {showIssueModal && (
            <IssueCreateModal
              isOpen={showIssueModal}
              initialRepo={selectedRepo || undefined}
              prefillTitle={issuePrefillTitle}
              onClose={() => setShowIssueModal(false)}
              onCreated={(issue) => {
                try {
                  const url = issue?.html_url ? ` ${issue.html_url}` : "";
                  onSendMessage(
                    `[GitHub] Issue created: ${issue?.title || "Untitled"}${url}`,
                  );
                } catch {
                  // best-effort
                }
              }}
            />
          )}

          {showActionsModal && (
            <IssueActionsModal
              isOpen={showActionsModal}
              initialRepo={selectedRepo || undefined}
              prefillCmd={actionsPrefill}
              onClose={() => setShowActionsModal(false)}
            />
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

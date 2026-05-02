import React from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CommandItem } from "./meetingChatSidebar.shared";

export const Composer = ({ draft, setDraft, onTyping, submitDraft, showCommandPalette, filteredCommands, activeCommandIndex, openCommand, setShowCommandPalette, inputRef, setActiveCommandIndex, selectedRepo, activeCommand, groupedCommands}: {
    draft: string;
    setDraft: (draft: string) => void;
    onTyping: (isTyping: boolean) => void;
    submitDraft: () => void;
    showCommandPalette: boolean;
    filteredCommands: CommandItem[];
    activeCommandIndex: number;
    openCommand: (command: CommandItem) => void;
    selectedRepo?: string;
    setShowCommandPalette: (show: boolean) => void;
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
    setActiveCommandIndex: React.Dispatch<React.SetStateAction<number>>;
    activeCommand?: CommandItem;
    groupedCommands: Record<string, CommandItem[]>;
}) => {
    
    return (
        <div className="shrink-0 border-t border-[#f5a623]/10 bg-black/20 px-4 py-4">
            <div className="relative rounded-[24px] border border-white/8 bg-white/4 p-2">
                <AnimatePresence>
                    {showCommandPalette && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="absolute bottom-full left-0 mb-2 w-full z-20"
                        key="command-palette"
                      >
                        <div className="rounded-[20px] border border-[#f5a623]/10 bg-[#0b0a08] p-2.5">
                          <div className="mb-2 flex items-center justify-between px-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9f8251]">Slash commands</p>
                            <p className="text-[11px] text-[#b89a63]">Enter to open</p>
                          </div>

                          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                            {Object.entries(groupedCommands).map(([group, items]) => (
                              <div key={group}>
                                <p className="px-2 pb-1 text-[11px] font-semibold text-[#d3b783]">{group}</p>
                                <div className="space-y-1">
                                  {items.map((item) => {
                                    const globalIndex = filteredCommands.findIndex((command) => command.id === item.id);
                                    const isActive = activeCommandIndex === globalIndex;
                                    const Icon = item.icon;

                                    return (
                                      <button
                                        key={item.id}
                                        type="button"
                                        onMouseEnter={() => setActiveCommandIndex(globalIndex)}
                                        onClick={() => openCommand(item)}
                                        className={["flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition", isActive ? "border-[#f5a623]/22 bg-[#f5a623]/10" : "border-transparent bg-transparent hover:border-white/8 hover:bg-white/4"].join(" ")}
                                      >
                                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl border border-[#f5a623]/12 bg-[#f5a623]/10 text-[#f5c050]">
                                          <Icon className="size-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-semibold text-[#fff5de]">{item.title}</span>
                                            <span className="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[11px] text-[#d9c39d]">{item.cmd}</span>
                                          </span>
                                          <span className="mt-1 block text-[12px] leading-relaxed text-[#cbb38a]">{item.description}</span>
                                          <span className="mt-1 block text-[11px] text-[#9f8251]">Example: {item.example}</span>
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            {filteredCommands.length === 0 ? (
                              <div className="rounded-2xl border border-white/8 bg-white/3 px-3 py-4 text-sm text-[#cbb38a]">No matching command. Try <span className="text-[#fff5de]">/createissue</span> or <span className="text-[#fff5de]">/listissues</span>.</div>
                            ) : null}
                          </div>

                          {activeCommand ? (
                            <div className="mt-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-2.5 text-[12px] text-[#d7c29c]">Target repo: <span className="font-semibold text-[#fff5de]">{selectedRepo || "Choose a connected repo"}</span></div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  placeholder="Message the room or type / for GitHub commands"
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setDraft(nextValue);
                    onTyping(nextValue.trim().length > 0);
                    event.target.style.height = "auto";
                    event.target.style.height =
                      Math.min(event.target.scrollHeight, 112) + "px";
                    setShowCommandPalette(nextValue.trim().startsWith("/"));
                  }}
                  onKeyDown={(event) => {
                    if (
                      showCommandPalette &&
                      filteredCommands.length > 0 &&
                      event.key === "ArrowDown"
                    ) {
                      event.preventDefault();
                      setActiveCommandIndex((index) =>
                        Math.min(index + 1, filteredCommands.length - 1),
                      );
                      return;
                    }

                    if (
                      showCommandPalette &&
                      filteredCommands.length > 0 &&
                      event.key === "ArrowUp"
                    ) {
                      event.preventDefault();
                      setActiveCommandIndex((index) => Math.max(index - 1, 0));
                      return;
                    }

                    if (
                      showCommandPalette &&
                      filteredCommands.length > 0 &&
                      event.key === "Tab"
                    ) {
                      event.preventDefault();
                      setDraft(`${filteredCommands[activeCommandIndex]?.cmd} `);
                      return;
                    }

                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();

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

                <div className="flex items-center justify-between px-3 py-1 mt-2 text-[11px] text-[#b49650]/40 border-t border-[#f5a623]/10">
                    <span>Enter to send · Shift+Enter for new line</span>
                </div>
            </div>
        </div>
    )
}
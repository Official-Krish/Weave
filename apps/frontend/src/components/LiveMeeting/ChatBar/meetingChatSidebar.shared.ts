import {
  CircleDot,
  ListTodo,
  MessageCircleMore,
  PlusCircle,
  Tag,
  UserPlus,
} from "lucide-react";

export type CommandItem = {
  id: string;
  cmd: string;
  title: string;
  description: string;
  example: string;
  group: string;
  icon: typeof PlusCircle;
};

export const AVATAR_GRADIENTS = [
  "from-[#ffcf6b] to-[#f5a623]",
  "from-[#85b7eb] to-[#378add]",
  "from-[#97c459] to-[#639922]",
  "from-[#afa9ec] to-[#7f77dd]",
  "from-[#f0997b] to-[#d85a30]",
];

export const AVATAR_TEXT = [
  "text-[#1b1100]",
  "text-[#042c53]",
  "text-[#173404]",
  "text-[#26215c]",
  "text-[#4a1b0c]",
];

export const COMMAND_ITEMS: CommandItem[] = [
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

export function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function senderIndex(name: string) {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) & 0xffff;
  return hash % AVATAR_GRADIENTS.length;
}

export function getCommandFromDraft(draft: string) {
  const trimmed = draft.trim();
  return COMMAND_ITEMS.find((item) =>
    new RegExp(`^\\${item.cmd}(?:\\s|$)`).test(trimmed),
  );
}
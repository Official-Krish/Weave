import { ExternalLink } from "lucide-react";
import type { Issue, IssueDraft } from "./issueActions.shared";

export function IssueActionsIssueCard({
  issue,
  draft,
  onClose,
  onComment,
  onAssign,
  onLabels,
  onDraftChange,
  isClosePending,
  isCommentPending,
  isAssignPending,
  isLabelsPending,
}: {
  issue: Issue;
  draft: IssueDraft;
  onClose: (issueNumber: number) => void;
  onComment: (issueNumber: number) => void;
  onAssign: (issueNumber: number) => void;
  onLabels: (issueNumber: number) => void;
  onDraftChange: (issueNumber: number, key: keyof IssueDraft, value: string) => void;
  isClosePending: boolean;
  isCommentPending: boolean;
  isAssignPending: boolean;
  isLabelsPending: boolean;
}) {
  return (
    <div className="rounded border border-white/8 bg-white/4 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <a
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#f5a623]"
            href={issue.html_url}
            target="_blank"
            rel="noreferrer"
          >
            #{issue.number} {issue.title}
            <ExternalLink className="size-3 shrink-0" />
          </a>
          <div className="text-xs text-[#c8a870]/60">{issue.state}</div>
        </div>
        <button
          type="button"
          onClick={() => onClose(issue.number)}
          disabled={isClosePending || issue.state === "closed"}
          className="shrink-0 rounded bg-white/5 px-2 py-1 text-xs text-[#fff5de] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isClosePending ? "Closing…" : "Close"}
        </button>
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        <div>
          <label className="text-xs text-[#c8a870]/60">Comment</label>
          <div className="mt-1 flex gap-2">
            <input
              value={draft.comment}
              onChange={(e) => onDraftChange(issue.number, "comment", e.target.value)}
              className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-[#fff5de] outline-none focus:border-[#f5a623]/40"
            />
            <button
              type="button"
              onClick={() => onComment(issue.number)}
              disabled={isCommentPending}
              className="rounded bg-[#f5a623] px-2 py-1 text-xs font-semibold text-black disabled:opacity-50 cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#c8a870]/60">Assign</label>
          <div className="mt-1 flex gap-2">
            <input
              value={draft.assignees}
              onChange={(e) => onDraftChange(issue.number, "assignees", e.target.value)}
              placeholder="user1, user2"
              className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-[#fff5de] outline-none placeholder:text-[#c8a870]/30 focus:border-[#f5a623]/40"
            />
            <button
              type="button"
              onClick={() => onAssign(issue.number)}
              disabled={isAssignPending}
              className="rounded bg-[#f5a623] px-2 py-1 text-xs font-semibold text-black disabled:opacity-50 cursor-pointer"
            >
              Assign
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#c8a870]/60">Labels</label>
          <div className="mt-1 flex gap-2">
            <input
              value={draft.labels}
              onChange={(e) => onDraftChange(issue.number, "labels", e.target.value)}
              placeholder="bug, urgent"
              className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-[#fff5de] outline-none placeholder:text-[#c8a870]/30 focus:border-[#f5a623]/40"
            />
            <button
              type="button"
              onClick={() => onLabels(issue.number)}
              disabled={isLabelsPending}
              className="rounded bg-[#f5a623] px-2 py-1 text-xs font-semibold text-black disabled:opacity-50 cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
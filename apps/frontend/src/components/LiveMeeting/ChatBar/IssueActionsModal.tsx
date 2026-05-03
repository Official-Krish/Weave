import { LoaderCircle, X } from "lucide-react";
import { getErrorMessage, getIssueDraft } from "./issueActions.shared";
import { IssueActionsIssueCard } from "./IssueActionsIssueCard";
import { useIssueActionsQueries } from "./issueActionsQueries.ts";

export function IssueActionsModal({
  isOpen,
  onClose,
  prefillCmd,
  initialRepo,
}: {
  isOpen: boolean;
  onClose: () => void;
  prefillCmd?: string;
  initialRepo?: string;
}) {
  const {
    selectedRepo,
    setSelectedRepo,
    reposQuery,
    issuesQuery,
    drafts,
    updateDraft,
    doComment,
    doClose,
    doAssign,
    doLabels,
    actionError,
    isCommentPending,
    isClosePending,
    isAssignPending,
    isLabelsPending,
  } = useIssueActionsQueries({
    isOpen,
    prefillCmd,
    initialRepo,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[86vh] w-full max-w-215 overflow-hidden rounded-xl border border-[#f5a623]/12 bg-[#0d0b08] p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#fff5de]">
            Repository Issues & Actions
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-[#c8a870]/70 transition hover:bg-white/8 cursor-pointer"
            aria-label="Close issue actions modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex max-h-[72vh] flex-col gap-3 overflow-y-auto md:flex-row">
          <div className="space-y-2 md:w-64 md:shrink-0">
            <label className="text-sm text-[#c8a870]/70">Repository</label>
            <select
              className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-sm text-[#fff5de] outline-none focus:border-[#f5a623]/40"
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              disabled={reposQuery.isLoading || reposQuery.isError}
            >
              {reposQuery.data?.map((repo) => (
                <option key={repo.full_name} value={repo.full_name}>
                  {repo.full_name}
                </option>
              ))}
            </select>

            <div className="rounded border border-[#f5a623]/8 bg-[#f5a623]/5 p-3 text-sm text-[#c8a870]/60">
              Repositories shown here are the GitHub repos this account can push
              to.
            </div>
          </div>

          <div className="flex-1">
            {reposQuery.isLoading || issuesQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#c8a870]/50">
                <LoaderCircle className="size-4 animate-spin" />
                Loading issues…
              </div>
            ) : reposQuery.isError ? (
              <div className="rounded border border-[#f5a623]/8 bg-[#f5a623]/5 p-3 text-sm text-[#f5a623]/80">
                {getErrorMessage(
                  reposQuery.error,
                  "GitHub is not connected. Connect GitHub in your profile first.",
                )}
                <div className="mt-2">
                  <a
                    href="/profile"
                    className="text-sm text-[#f5a623] underline"
                  >
                    Open profile
                  </a>
                </div>
              </div>
            ) : (reposQuery.data?.length || 0) === 0 ? (
              <div className="rounded border border-[#f5a623]/8 bg-[#f5a623]/5 p-3 text-sm text-[#f5a623]/80">
                No repositories with issue access were found for this GitHub
                account.
              </div>
            ) : issuesQuery.isError ? (
              <div className="rounded border border-[#f5a623]/8 bg-[#f5a623]/5 p-3 text-sm text-[#f5a623]/80">
                {getErrorMessage(
                  issuesQuery.error,
                  "Failed to load issues for this repository.",
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {(issuesQuery.data || []).map((issue) => {
                  const draft = getIssueDraft(drafts, issue.number);

                  return (
                    <IssueActionsIssueCard
                      key={issue.id}
                      issue={issue}
                      draft={draft}
                      onClose={doClose}
                      onComment={doComment}
                      onAssign={doAssign}
                      onLabels={doLabels}
                      onDraftChange={updateDraft}
                      isClosePending={isClosePending}
                      isCommentPending={isCommentPending}
                      isAssignPending={isAssignPending}
                      isLabelsPending={isLabelsPending}
                    />
                  );
                })}

                {(issuesQuery.data || []).length === 0 && (
                  <div className="text-sm text-[#c8a870]/60">
                    No open issues found for this repository.
                  </div>
                )}

                {actionError && (
                  <div className="rounded border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                    {getErrorMessage(actionError, "GitHub action failed.")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueActionsModal;
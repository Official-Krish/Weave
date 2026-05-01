import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LoaderCircle, X } from "lucide-react";
import { http } from "../../https";

type Issue = {
  id: string;
  number: number;
  title: string;
  html_url?: string;
  state?: string;
};
type RepoItem = { name: string; full_name: string; owner?: { login: string } };
type IssueDrafts = Record<
  number,
  { comment: string; assignees: string; labels: string }
>;

const githubReposQueryKey = ["github", "repos"] as const;

function getIssueDraft(drafts: IssueDrafts, issueNumber: number) {
  return drafts[issueNumber] || { comment: "", assignees: "", labels: "" };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } })
      .response;
    return response?.data?.error || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

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
  const [selectedRepo, setSelectedRepo] = useState("");
  const [drafts, setDrafts] = useState<IssueDrafts>({});
  const queryClient = useQueryClient();

  const reposQuery = useQuery<RepoItem[]>({
    queryKey: githubReposQueryKey,
    queryFn: async () => {
      const res = await http.get("/github/repos");
      return res.data.githubRepos || res.data.repos || [];
    },
    enabled: isOpen,
    retry: false,
  });

  const issuesQueryKey = ["github", "issues", selectedRepo] as const;

  const issuesQuery = useQuery<Issue[]>({
    queryKey: issuesQueryKey,
    queryFn: async () => {
      const res = await http.get("/github/issues", {
        params: { repo: selectedRepo },
      });
      return res.data.issues || res.data || [];
    },
    enabled: Boolean(selectedRepo && isOpen),
    retry: false,
  });

  useEffect(() => {
    if (!isOpen || !reposQuery.data?.length) return;

    if (initialRepo) {
      const matchingInitialRepo = reposQuery.data.find(
        (item) => item.full_name === initialRepo,
      );

      if (matchingInitialRepo) {
        setSelectedRepo(matchingInitialRepo.full_name);
        return;
      }
    }

    const repoFromCommand = prefillCmd?.split(/\s+/)[0];
    const matchingRepo = repoFromCommand
      ? reposQuery.data.find((item) => item.full_name === repoFromCommand)
      : undefined;

    setSelectedRepo(
      matchingRepo?.full_name || reposQuery.data[0].full_name || "",
    );
  }, [initialRepo, isOpen, prefillCmd, reposQuery.data]);

  const updateDraft = (
    issueNumber: number,
    key: keyof IssueDrafts[number],
    value: string,
  ) => {
    setDrafts((current) => ({
      ...current,
      [issueNumber]: {
        ...getIssueDraft(current, issueNumber),
        [key]: value,
      },
    }));
  };

  const commentMutation = useMutation({
    mutationFn: async ({
      issueNumber,
      comment,
    }: {
      issueNumber: number;
      comment: string;
    }) =>
      http.post("/github/issue/comment", {
        repo: selectedRepo,
        issueNumber,
        comment,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: issuesQueryKey }),
  });

  const closeMutation = useMutation({
    mutationFn: async (issueNumber: number) =>
      http.patch("/github/issue/update", {
        repo: selectedRepo,
        issueNumber,
        state: "closed",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: issuesQueryKey }),
  });

  const assignMutation = useMutation({
    mutationFn: async ({
      issueNumber,
      assignees,
    }: {
      issueNumber: number;
      assignees: string[];
    }) =>
      http.post("/github/issue/assign", {
        repo: selectedRepo,
        issueNumber,
        assignees,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: issuesQueryKey }),
  });

  const labelsMutation = useMutation({
    mutationFn: async ({
      issueNumber,
      labels,
    }: {
      issueNumber: number;
      labels: string[];
    }) =>
      http.post("/github/issue/labels", {
        repo: selectedRepo,
        issueNumber,
        labels,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: issuesQueryKey }),
  });

  const doComment = (issueNumber: number) => {
    const comment = getIssueDraft(drafts, issueNumber).comment.trim();
    if (!comment) return;

    commentMutation.mutate({ issueNumber, comment });
    updateDraft(issueNumber, "comment", "");
  };

  const doClose = (issueNumber: number) => closeMutation.mutate(issueNumber);

  const doAssign = (issueNumber: number) => {
    const assignees = getIssueDraft(drafts, issueNumber)
      .assignees.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!assignees.length) return;

    assignMutation.mutate({ issueNumber, assignees });
    updateDraft(issueNumber, "assignees", "");
  };

  const doLabels = (issueNumber: number) => {
    const labels = getIssueDraft(drafts, issueNumber)
      .labels.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!labels.length) return;

    labelsMutation.mutate({ issueNumber, labels });
    updateDraft(issueNumber, "labels", "");
  };

  if (!isOpen) return null;

  const actionError =
    commentMutation.error ||
    closeMutation.error ||
    assignMutation.error ||
    labelsMutation.error;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[86vh] w-full max-w-[860px] overflow-hidden rounded-xl border border-[#f5a623]/12 bg-[#0d0b08] p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#fff5de]">
            Repository Issues & Actions
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-[#c8a870]/70 transition hover:bg-white/8"
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
                    <div
                      key={issue.id}
                      className="rounded border border-white/8 bg-white/4 p-3"
                    >
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
                          <div className="text-xs text-[#c8a870]/60">
                            {issue.state}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => doClose(issue.number)}
                          disabled={
                            closeMutation.isPending || issue.state === "closed"
                          }
                          className="shrink-0 rounded bg-white/5 px-2 py-1 text-xs text-[#fff5de] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {closeMutation.isPending ? "Closing…" : "Close"}
                        </button>
                      </div>

                      <div className="mt-3 grid gap-2 lg:grid-cols-3">
                        <div>
                          <label className="text-xs text-[#c8a870]/60">
                            Comment
                          </label>
                          <div className="mt-1 flex gap-2">
                            <input
                              value={draft.comment}
                              onChange={(e) =>
                                updateDraft(
                                  issue.number,
                                  "comment",
                                  e.target.value,
                                )
                              }
                              className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-[#fff5de] outline-none focus:border-[#f5a623]/40"
                            />
                            <button
                              type="button"
                              onClick={() => doComment(issue.number)}
                              disabled={commentMutation.isPending}
                              className="rounded bg-[#f5a623] px-2 py-1 text-xs font-semibold text-black disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-[#c8a870]/60">
                            Assign
                          </label>
                          <div className="mt-1 flex gap-2">
                            <input
                              value={draft.assignees}
                              onChange={(e) =>
                                updateDraft(
                                  issue.number,
                                  "assignees",
                                  e.target.value,
                                )
                              }
                              placeholder="user1, user2"
                              className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-[#fff5de] outline-none placeholder:text-[#c8a870]/30 focus:border-[#f5a623]/40"
                            />
                            <button
                              type="button"
                              onClick={() => doAssign(issue.number)}
                              disabled={assignMutation.isPending}
                              className="rounded bg-[#f5a623] px-2 py-1 text-xs font-semibold text-black disabled:opacity-50"
                            >
                              Assign
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-[#c8a870]/60">
                            Labels
                          </label>
                          <div className="mt-1 flex gap-2">
                            <input
                              value={draft.labels}
                              onChange={(e) =>
                                updateDraft(
                                  issue.number,
                                  "labels",
                                  e.target.value,
                                )
                              }
                              placeholder="bug, urgent"
                              className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-2 py-1 text-sm text-[#fff5de] outline-none placeholder:text-[#c8a870]/30 focus:border-[#f5a623]/40"
                            />
                            <button
                              type="button"
                              onClick={() => doLabels(issue.number)}
                              disabled={labelsMutation.isPending}
                              className="rounded bg-[#f5a623] px-2 py-1 text-xs font-semibold text-black disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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

export type Issue = {
  id: string;
  number: number;
  title: string;
  html_url?: string;
  state?: string;
};

export type RepoItem = { name: string; full_name: string; owner?: { login: string } };

export type IssueDraft = {
  comment: string;
  assignees: string;
  labels: string;
};

export type IssueDrafts = Record<number, IssueDraft>;

export const githubReposQueryKey = ["github", "repos"] as const;

export const emptyIssueDraft: IssueDraft = {
  comment: "",
  assignees: "",
  labels: "",
};

export function getIssueDraft(drafts: IssueDrafts, issueNumber: number) {
  return drafts[issueNumber] || emptyIssueDraft;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } })
      .response;
    return response?.data?.error || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
import { BACKEND_URL } from "./config";

function getBackendOrigin() {
  try {
    return new URL(BACKEND_URL).origin;
  } catch {
    return "";
  }
}

const backendOrigin = getBackendOrigin();

export function resolveMediaUrl(rawUrl?: string | null) {
  const value = String(rawUrl || "").trim();
  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/api/")) {
    return backendOrigin ? `${backendOrigin}${value}` : value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

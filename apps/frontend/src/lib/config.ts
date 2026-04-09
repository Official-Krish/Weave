export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/v1";

function normalizeJitsi(value: string | undefined) {
  const fallbackBaseUrl = "http://localhost";

  if (!value || !value.trim()) {
    return {
      baseUrl: fallbackBaseUrl,
      domain: "localhost",
    };
  }

  const trimmed = value.trim().replace(/\/$/, "");

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return {
        baseUrl: `${parsed.protocol}//${parsed.host}`,
        domain: parsed.host,
      };
    } catch {
      return {
        baseUrl: fallbackBaseUrl,
        domain: "localhost",
      };
    }
  }

  return {
    baseUrl: `http://${trimmed}`,
    domain: trimmed,
  };
}

const jitsiConfig = normalizeJitsi(import.meta.env.VITE_PUBLIC_JITSI_URL);

export const JITSI_BASE_URL = jitsiConfig.baseUrl;
export const JITSI_DOMAIN = jitsiConfig.domain;

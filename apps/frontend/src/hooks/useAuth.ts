import { useEffect, useState } from "react";
import { clearStoredAuth, getStoredName, getStoredToken } from "../lib/auth";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return getStoredToken();
  });
  const [name, setName] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return getStoredName();
  });

  useEffect(() => {
    const syncAuth = () => {
      setToken(getStoredToken());
      setName(getStoredName());
    };

    window.addEventListener("weave-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("weave-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return {
    token,
    name,
    isAuthenticated: Boolean(token),
    signOut: clearStoredAuth,
  };
}

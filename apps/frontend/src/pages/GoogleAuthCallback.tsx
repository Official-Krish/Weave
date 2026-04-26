import { persistAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// /auth/callback page
export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const name = params.get("name");
    const error = params.get("error");

    if (error || !token) {
      navigate("/signin?error=google_auth_failed");
      return;
    }

    persistAuth(token, name ?? "");
    navigate("/dashboard");
  }, [navigate]);

  return <div>Signing you in...</div>;
}

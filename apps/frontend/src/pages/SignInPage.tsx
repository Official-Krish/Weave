import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../https";
import { persistAuth } from "../lib/auth";
import { getHttpErrorMessage } from "../lib/httpError";
import type { LoginResponse } from "../types/api";

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post<LoginResponse>("/user/login", {
        email,
        password,
      });

      return response.data;
    },
    onSuccess: (data) => {
      persistAuth(data.token, data.name);
      navigate("/meetings");
    },
    onError: (error) => {
      setErrorMessage(
        getHttpErrorMessage(
          error,
          "Could not sign you in. Check your email and password."
        )
      );
    },
  });

  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Access
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Basic auth placeholder for the new app.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        This now talks to the existing backend login endpoint so phase 1 meeting
        actions can use the authenticated APIs.
      </p>
      <div className="motion-rise motion-delay-2 max-w-md space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/85 focus:border-primary focus:ring-2 focus:ring-primary/35"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/85 focus:border-primary focus:ring-2 focus:ring-primary/35"
        />
        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            loginMutation.mutate();
          }}
          disabled={loginMutation.isPending || !email.trim() || !password.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_10px_20px_rgba(16,115,108,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:opacity-60"
        >
          {loginMutation.isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : null}
          Continue
        </button>
        {errorMessage ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Need an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}

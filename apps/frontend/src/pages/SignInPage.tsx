import { useMutation } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { GoogleAuthResponse, LoginResponse } from "@repo/types/api";
import { http } from "../https";
import { persistAuth } from "../lib/auth";
import { getHttpErrorMessage } from "../lib/httpError";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

export function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

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
      navigate("/dashboard");
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

  const googleSignupMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await http.post<GoogleAuthResponse>("/google/auth", { idToken });
      return response.data;
    },
    onSuccess: (data) => {
      persistAuth(data.token, data.name);
      navigate("/dashboard");
    },
    onError: (error) => {
      setErrorMessage(getHttpErrorMessage(error, "Google authentication failed. Please try again."));
    },
  });

  return (
    <section className="relative min-h-[calc(100vh-76px)] overflow-hidden px-6 py-10 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.05fr_1fr]">
        <div className="rounded-3xl border border-[#f5a623]/12 bg-linear-to-br from-[#100d09] to-[#12100c] p-8 sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#f5a623]/65">Welcome back</p>
          <h1 className="mt-3 font-syne text-[28px] font-black leading-tight tracking-tight text-[#fff5de] sm:text-[34px]">
            Sign in and keep
            <br />
            recording locally.
          </h1>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-[#c8b080]/70">
            Access your meetings, recordings, and editor with the same black-and-gold experience across the app.
          </p>

          <div className="mt-7 space-y-2.5">
            {[
              {
                icon: "lock",
                title: "Encrypted sessions",
                sub: "Your account stays tied to your local-first workflow.",
              },
              {
                icon: "mail",
                title: "Quick access to meetings",
                sub: "Jump straight into your team’s recordings and live rooms.",
              },
              {
                icon: "arrow",
                title: "Fast handoff to the app",
                sub: "One sign in and you are back in the workspace.",
              },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 rounded-2xl border border-[#f5a623]/10 bg-black/20 px-4 py-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#f5a623]/12 shrink-0">
                  <FeatureIcon name={icon} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[#fff5de]/85">{title}</p>
                  <p className="text-[11px] text-[#c8a870]/50">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/3 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <img src="/logo-navbar.svg" alt="Weave" className="h-6 w-auto" />
          </div>

          <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-[#fff5de]">
            Sign in to your account
          </h2>
          <p className="mt-1.5 mb-6 text-[13px] text-[#c8b880]/55">
            Pick up where you left off. No extra setup needed.
          </p>

          <div className="space-y-3.5">
            <Field label="Work email" icon={<Mail className="size-3.5" />}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-4 text-sm text-[#fff5de] outline-none placeholder:text-[#c8b880]/35 transition focus:border-[#f5a623]/40 focus:bg-[#f5a623]/3"
              />
            </Field>

            <Field label="Password" icon={<Lock className="size-3.5" />}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-4 text-sm text-[#fff5de] outline-none placeholder:text-[#c8b880]/35 transition focus:border-[#f5a623]/40 focus:bg-[#f5a623]/3"
              />
            </Field>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                loginMutation.mutate();
              }}
              disabled={loginMutation.isPending || !canSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#ffcf6b] via-[#f5a623] to-[#d98a10] py-3 text-sm font-extrabold text-[#1b1100] shadow-[0_4px_20px_rgba(245,166,35,0.25)] transition hover:opacity-92 hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none cursor-pointer"
            >
              {loginMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Sign in
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-[11px] text-white/30">or continue with</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            {/* Google OAuth */}
            <GoogleLogin
              theme="filled_black"
              size="large"
              shape="pill"
              text="continue_with"
              onSuccess={async (credentialResponse) => {
                if (!credentialResponse.credential) {
                  setErrorMessage("Google authentication failed. No credential received.");
                  return;
                }
                googleSignupMutation.mutate(credentialResponse.credential);
              }}
              onError={() => toast.error("Google authentication failed. Please try again.")}
            />

            {errorMessage ? (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {errorMessage}
              </p>
            ) : null}

            <p className="text-center text-xs text-[#c8b880]/50">
              Need an account?{" "}
              <Link to="/signup" className="font-bold text-[#f5a623] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#c8a870]/60">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#c8a060]/45">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    lock: <svg className="size-3.5 text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    mail: <svg className="size-3.5 text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
    arrow: <svg className="size-3.5 text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>,
  };

  return <>{icons[name]}</>;
}

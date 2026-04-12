import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, ArrowRight, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../https";
import { persistAuth } from "../lib/auth";
import { getHttpErrorMessage } from "../lib/httpError";
import type { SignupResponse } from "@repo/types/api";

export function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0;

  const signupMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post<SignupResponse>("/user/signup", { name, email, password });
      return response.data;
    },
    onSuccess: (data) => {
      persistAuth(data.token, name);
      navigate("/meetings");
    },
    onError: (error) => {
      setErrorMessage(getHttpErrorMessage(error, "Could not create your account. Try a different email."));
    },
  });

  return (
    <section className="relative min-h-[calc(100vh-76px)] overflow-hidden px-6 py-10 sm:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Form card */}
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          {/* Wordmark */}
          <div className="mb-6 flex items-center gap-2.5">
            <img src="/logo-navbar.svg" alt="Weave" className="h-6 w-auto" />
          </div>

          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-[#fff5de]">
            Create your account
          </h1>
          <p className="mt-1.5 mb-6 text-[13px] text-[#c8b880]/55">
            Free forever. No credit card needed.
          </p>

          <div className="space-y-3.5">
            <Field label="Full name" icon={<User className="size-3.5" />}>
              <input
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-4 text-sm text-[#fff5de] outline-none placeholder:text-[#c8b880]/35 transition focus:border-[#f5a623]/40 focus:bg-[#f5a623]/[0.03] focus:ring-0"
              />
            </Field>

            <Field label="Work email" icon={<Mail className="size-3.5" />}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-4 text-sm text-[#fff5de] outline-none placeholder:text-[#c8b880]/35 transition focus:border-[#f5a623]/40 focus:bg-[#f5a623]/[0.03]"
              />
            </Field>

            <Field label="Password" icon={<Lock className="size-3.5" />}>
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/8 bg-white/4 py-2.5 pl-9 pr-4 text-sm text-[#fff5de] outline-none placeholder:text-[#c8b880]/35 transition focus:border-[#f5a623]/40 focus:bg-[#f5a623]/[0.03]"
              />
            </Field>

            <button
              type="button"
              onClick={() => { setErrorMessage(null); signupMutation.mutate(); }}
              disabled={signupMutation.isPending || !canSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#ffcf6b] via-[#f5a623] to-[#d98a10] py-3 text-sm font-extrabold text-[#1b1100] shadow-[0_4px_20px_rgba(245,166,35,0.25)] transition hover:opacity-92 hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none cursor-pointer"
            >
              {signupMutation.isPending
                ? <LoaderCircle className="size-4 animate-spin" />
                : <ArrowRight className="size-4" />}
              Create account
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-[11px] text-white/30">or continue with</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/8 bg-white/4 py-2.5 text-sm font-semibold text-[#fff5de]/80 transition hover:bg-white/7"
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {errorMessage && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {errorMessage}
              </p>
            )}

            <p className="text-center text-xs text-[#c8b880]/50">
              Already have an account?{" "}
              <Link to="/signin" className="font-bold text-[#f5a623] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Promo card */}
        <div className="rounded-3xl border border-[#f5a623]/12 bg-gradient-to-br from-[#100e08] to-[#13100a] p-8 sm:p-10 flex flex-col">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#f5a623]/65">
            Start free · No card required
          </p>
          <h2 className="mt-3 font-syne text-[28px] font-black leading-tight tracking-tight text-[#fff5de] sm:text-[34px]">
            Record beautifully,<br />from day one.
          </h2>
          <p className="mt-4 text-[13px] leading-relaxed text-[#c8b080]/70">
            Join teams who rely on Weave for interviews, podcasts, and remote sessions where quality cannot fail.
          </p>

          <div className="mt-7 space-y-2.5">
            {[
              {
                icon: "shield",
                title: "AES-128 encrypted by default",
                sub: "Your recordings never leave unencrypted",
              },
              {
                icon: "clock",
                title: "100% local quality recording",
                sub: "Network issues never touch your audio",
              },
              {
                icon: "download",
                title: "One-click merge and export",
                sub: "4K video · WAV audio · MP4 delivery",
              },
            ].map(({ icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-2xl border border-[#f5a623]/10 bg-black/20 px-4 py-3"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#f5a623]/12 flex-shrink-0">
                  <FeatureIcon name={icon} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-[#fff5de]/85">{title}</p>
                  <p className="text-[11px] text-[#c8a870]/50">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-auto flex items-center gap-3 border-t border-[#f5a623]/8 pt-6 mt-7">
            <div className="flex">
              {["A", "M", "J", "S"].map((l, i) => (
                <span
                  key={l}
                  className="inline-flex size-7 items-center justify-center rounded-full border-2 border-[#13100a] bg-gradient-to-br from-[#ffcf6b] to-[#f5a623] text-[10px] font-extrabold text-[#1b1100]"
                  style={{ marginLeft: i === 0 ? 0 : -6 }}
                >
                  {l}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#c8a870]/60">
              <span className="font-bold text-[#f5a623]/80">2,400+</span> teams recording with Weave
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
    shield: <svg className="size-3.5 text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    clock: <svg className="size-3.5 text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    download: <svg className="size-3.5 text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>,
  };
  return <>{icons[name]}</>;
}
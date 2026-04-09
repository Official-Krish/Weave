import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, LogIn, Video } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FeatureCard } from "../components/FeatureCard";
import { useAuth } from "../hooks/useAuth";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";
import type {
  CreateMeetingResponse,
  JoinMeetingResponse,
} from "../types/api";

export function MeetingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, name } = useAuth();
  const [createRoomName, setCreateRoomName] = useState("");
  const [createPasscode, setCreatePasscode] = useState("");
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [joinPasscode, setJoinPasscode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMeetingMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post<CreateMeetingResponse>("/meeting/create", {
        roomName: createRoomName,
        passcode: createPasscode || undefined,
        participants: [],
      });

      return response.data;
    },
    onSuccess: (data) => {
      navigate(
        `/meetings/live/${data.meetingId}?name=${encodeURIComponent(
          data.name || name || "Host"
        )}&role=host`
      );
    },
    onError: (error) => {
      setErrorMessage(
        getHttpErrorMessage(error, "Could not create the meeting. Please try again.")
      );
    },
  });

  const joinMeetingMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post<JoinMeetingResponse>(
        `/meeting/join/${joinMeetingId}`,
        {
          passcode: joinPasscode || undefined,
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      navigate(
        `/meetings/live/${data.id}?name=${encodeURIComponent(
          data.name || name || "Guest"
        )}&role=guest`
      );
    },
    onError: (error) => {
      setErrorMessage(
        getHttpErrorMessage(
          error,
          "Could not join the meeting. Check the meeting ID and passcode."
        )
      );
    },
  });

  const isBusy =
    createMeetingMutation.isPending || joinMeetingMutation.isPending;

  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Meetings
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Phase 1 starts here: meeting lifecycle and recording state.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        This page is a placeholder for create, join, and active meeting flows. We will connect it to the backend once the new recording-control API replaces the WebSocket layer.
      </p>

      {!isAuthenticated ? (
        <div className="mt-8 rounded-[1.5rem] border border-border bg-secondary/70 p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Sign in to create or join meetings
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The backend meeting APIs require authentication, so phase 1 starts
            with your signed-in session.
          </p>
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="mt-5 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Go to sign in
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="motion-rise motion-delay-1 rounded-[1.5rem] border border-border bg-card/94 p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Create a meeting
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start a new room as host and move straight into the Jitsi call.
            </p>

            <div className="mt-6 space-y-4">
              <input
                value={createRoomName}
                onChange={(event) => setCreateRoomName(event.target.value)}
                placeholder="Weekly sync"
                className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/85 focus:border-primary focus:ring-2 focus:ring-primary/35"
              />
              <input
                value={createPasscode}
                onChange={(event) => setCreatePasscode(event.target.value)}
                placeholder="Optional passcode"
                className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/85 focus:border-primary focus:ring-2 focus:ring-primary/35"
              />
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  createMeetingMutation.mutate();
                }}
                disabled={isBusy || !createRoomName.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_10px_20px_rgba(16,115,108,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:opacity-60"
              >
                {createMeetingMutation.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                Create and join
              </button>
            </div>
          </div>

          <div className="motion-rise motion-delay-2 rounded-[1.5rem] border border-border bg-card/94 p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Join a meeting
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter a meeting ID and optional passcode to join an existing room.
            </p>

            <div className="mt-6 space-y-4">
              <input
                value={joinMeetingId}
                onChange={(event) => setJoinMeetingId(event.target.value)}
                placeholder="meeting id"
                className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/85 focus:border-primary focus:ring-2 focus:ring-primary/35"
              />
              <input
                value={joinPasscode}
                onChange={(event) => setJoinPasscode(event.target.value)}
                placeholder="Passcode if required"
                className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/85 focus:border-primary focus:ring-2 focus:ring-primary/35"
              />
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  joinMeetingMutation.mutate();
                }}
                disabled={isBusy || !joinMeetingId.trim()}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary disabled:opacity-60"
              >
                {joinMeetingMutation.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Join meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage ? (
        <p className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <FeatureCard
          title="Create meeting"
          description="Host creates a room, invites participants, and becomes the source of truth for recording control."
        />
        <FeatureCard
          title="Join meeting"
          description="Participants fetch meeting state from the backend and upload local chunks during or after the session."
        />
      </div>
    </section>
  );
}

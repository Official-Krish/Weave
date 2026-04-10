import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  LoaderCircle,
  Users,
  Video,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";
import type { MeetingDetail } from "../types/api";

export function RecordingDetailPage() {
  const { recordingId = "" } = useParams();
  const { isAuthenticated } = useAuth();

  const meetingQuery = useQuery({
    queryKey: ["recording-detail", recordingId],
    queryFn: async () => {
      const response = await http.get<MeetingDetail>(`/meeting/get/${recordingId}`);
      return response.data;
    },
    enabled: isAuthenticated && Boolean(recordingId),
  });

  const meeting = meetingQuery.data;
  const latestAsset = meeting?.finalRecording?.[meeting.finalRecording.length - 1];
  const startedAt = meeting?.startTime ? new Date(meeting.startTime) : null;
  const endedAt = meeting?.endTime ? new Date(meeting.endTime) : null;
  const durationLabel =
    startedAt && endedAt
      ? `${Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))} min`
      : "Unknown";

  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Recording Detail
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {meeting?.roomName?.trim() || "Meeting Recording"}
          </h1>
        </div>
        <Link
          to="/recordings"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to recordings
        </Link>
      </div>

      {!isAuthenticated ? (
        <div className="mt-8 rounded-[1.5rem] border border-border bg-secondary/70 p-6">
          <h2 className="text-xl font-semibold text-foreground">Sign in required</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Recording details are available only in an authenticated session.
          </p>
          <Link
            to="/signin"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Go to sign in
          </Link>
        </div>
      ) : meetingQuery.isLoading ? (
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading meeting detail...
        </div>
      ) : meetingQuery.isError || !meeting ? (
        <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="inline-flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            {getHttpErrorMessage(meetingQuery.error, "Could not load recording detail.")}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-border bg-card/94 p-6">
            <h2 className="text-xl font-semibold text-foreground">Meeting metadata</h2>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <Video className="h-4 w-4" />
                Meeting ID: {meeting.meetingId}
              </p>
              <p className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants: {meeting.participants.length}
              </p>
              <p className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Created: {new Date(meeting.date).toLocaleString()}
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Duration: {durationLabel}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-card/94 p-6">
            <h2 className="text-xl font-semibold text-foreground">Recording asset</h2>
            {latestAsset ? (
              <div className="mt-5 space-y-4">
                <p className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Ready
                </p>
                <p className="text-sm text-muted-foreground">
                  Format: {latestAsset.format} | Quality: {latestAsset.quality}
                </p>
                <a
                  href={latestAsset.VideoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
                >
                  <Download className="h-4 w-4" />
                  Open video asset
                </a>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                Processing
                : final recording asset is not available yet.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

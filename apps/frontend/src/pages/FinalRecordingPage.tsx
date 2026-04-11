import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, LoaderCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { MeetingDetail } from "@repo/types/api";
import { useAuth } from "../hooks/useAuth";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";

export function FinalRecordingPage() {
  const { recordingId = "" } = useParams();
  const { isAuthenticated } = useAuth();

  const meetingQuery = useQuery({
    queryKey: ["final-recording", recordingId],
    queryFn: async () => {
      const response = await http.get<MeetingDetail>(`/meeting/get/${recordingId}`);
      return response.data;
    },
    enabled: isAuthenticated && Boolean(recordingId),
  });

  const meeting = meetingQuery.data;
  const latestAsset = meeting?.finalRecording?.[meeting.finalRecording.length - 1];

  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Final Recording
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {meeting?.roomName?.trim() || "Meeting Playback"}
          </h1>
        </div>
        <Link
          to={`/recordings/${recordingId}`}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to detail
        </Link>
      </div>

      {!isAuthenticated ? (
        <div className="mt-8 rounded-[1.5rem] border border-border bg-secondary/70 p-6">
          <h2 className="text-xl font-semibold text-foreground">Sign in required</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            You need an authenticated session to open final recordings.
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
          Loading final recording...
        </div>
      ) : meetingQuery.isError || !meeting ? (
        <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="inline-flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            {getHttpErrorMessage(meetingQuery.error, "Could not load final recording.")}
          </p>
        </div>
      ) : latestAsset ? (
        <div className="mt-8 rounded-[1.5rem] border border-border bg-card/94 p-6">
          <video
            src="/meeting_grid_recording.mp4"
            controls
            playsInline
            className="w-full rounded-xl border border-border bg-black"
          >
            <track kind="captions" />
          </video>
          <p className="mt-4 text-sm text-muted-foreground">
            This is a temporary in-browser test player using the native video tag.
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
          Final recording is not ready yet, or you do not have permission to view it.
        </div>
      )}
    </section>
  );
}

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, LoaderCircle, Play } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { MeetingDetail } from "@repo/types/api";
import { VideoPlayer } from "../components/videoPlayer";
import { useAuth } from "../hooks/useAuth";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";
import { resolveMediaUrl } from "../lib/mediaUrl";

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
  const hlsManifestUrl = meeting?.meetingId
    ? resolveMediaUrl(`/api/v1/recordings/${meeting.meetingId}/hls/master.m3u8`)
    : "";
  const thumbnailVttUrl = meeting?.meetingId
    ? resolveMediaUrl(`/api/v1/recordings/${meeting.meetingId}/hls/thumbnails.vtt`)
    : "";
  const posterUrl = meeting?.meetingId
    ? resolveMediaUrl(`/api/v1/recordings/${meeting.meetingId}/hls/poster.jpg`)
    : "";

  const hlsAvailabilityQuery = useQuery({
    queryKey: ["hls-availability", meeting?.meetingId],
    enabled: Boolean(hlsManifestUrl),
    retry: false,
    queryFn: async () => {
      const response = await fetch(hlsManifestUrl, { method: "HEAD" });
      return response.ok;
    },
  });
  console.log("HLS availability:", hlsAvailabilityQuery.data);

  const playbackUrl = hlsManifestUrl;

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
          <VideoPlayer
            src={playbackUrl}
            poster={posterUrl || undefined}
            thumbnailSrc={hlsAvailabilityQuery.data ? thumbnailVttUrl : undefined}
            className="w-full rounded-xl border border-[#f5a623]/12 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/12 bg-[#f5a623]/6 px-3 py-1 text-[#c8a870]">
              <Play className="h-3.5 w-3.5" />
              {hlsAvailabilityQuery.data ? "HLS streaming" : "Local asset playback"}
            </span>
            <span>
              {hlsAvailabilityQuery.data
                ? "Adaptive stream served from the local recordings folder (no CDN)."
                : "Video served from the local recordings folder. No CDN is used on this page."}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
          Final recording is not ready yet, or you do not have permission to view it.
        </div>
      )}
    </section>
  );
}

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  LoaderCircle,
  Save,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { MeetingDetail, RecordingVisibilityResponse } from "@repo/types/api";
import { useAuth } from "../hooks/useAuth";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";
import { resolveMediaUrl } from "../lib/mediaUrl";

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
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const latestAsset = meeting?.finalRecording?.[meeting.finalRecording.length - 1];
  const resolvedVideoLink = resolveMediaUrl(latestAsset?.VideoLink);
  const startedAt = meeting?.startTime ? new Date(meeting.startTime) : null;
  const endedAt = meeting?.endTime ? new Date(meeting.endTime) : null;
  const durationLabel =
    startedAt && endedAt
      ? `${Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))} min`
      : "Unknown";

  const visibilityQuery = useQuery({
    queryKey: ["recording-visibility", meeting?.meetingId],
    queryFn: async () => {
      const response = await http.get<RecordingVisibilityResponse>(`/meeting/recording/visibility/${meeting?.meetingId}`);
      return response.data;
    },
    enabled: Boolean(isAuthenticated && meeting?.isHost && meeting?.meetingId),
  });

  const eligibleParticipants = useMemo(() => {
    const hostEmail = visibilityQuery.data?.hostEmail?.toLowerCase() || "";
    return (visibilityQuery.data?.participants || []).filter((participant) => {
      const email = participant.email?.toLowerCase() || "";
      return Boolean(email) && email !== hostEmail;
    });
  }, [visibilityQuery.data?.hostEmail, visibilityQuery.data?.participants]);

  useEffect(() => {
    if (visibilityQuery.data?.visibleToEmails) {
      setSelectedEmails(visibilityQuery.data.visibleToEmails);
    }
  }, [visibilityQuery.data?.visibleToEmails]);

  const saveVisibilityMutation = useMutation({
    mutationFn: async () => {
      await http.put(`/meeting/recording/visibility/${meeting?.meetingId}`, {
        visibleToEmails: selectedEmails,
      });
    },
    onSuccess: () => {
      toast.success("Recording visibility updated");
      visibilityQuery.refetch();
      meetingQuery.refetch();
    },
    onError: (error) => {
      toast.error(getHttpErrorMessage(error, "Could not save visibility settings"));
    },
  });

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
                  href={resolvedVideoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
                >
                  <Download className="h-4 w-4" />
                  Open video asset
                </a>
                <Link
                  to={`/recordings/${recordingId}/final`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                >
                  <Video className="h-4 w-4" />
                  Open test player
                </Link>
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

      {meeting?.isHost ? (
        <div className="mt-6 rounded-[1.5rem] border border-border bg-card/94 p-6">
          <h2 className="text-xl font-semibold text-foreground">Recording visibility</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            By default only the host can view final recordings. Select participants who should also get access.
          </p>

          {visibilityQuery.isLoading ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading participants...
            </div>
          ) : visibilityQuery.isError ? (
            <p className="mt-4 text-sm text-destructive">
              {getHttpErrorMessage(visibilityQuery.error, "Could not load visibility settings")}
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {eligibleParticipants.map((participant) => {
                  const email = participant.email?.toLowerCase() || "";
                  const checked = selectedEmails.includes(email);

                  return (
                    <label
                      key={participant.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-secondary/35 px-3 py-2 text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          if (!email) {
                            return;
                          }

                          setSelectedEmails((current) => {
                            if (event.target.checked) {
                              return [...current, email];
                            }
                            return current.filter((item) => item !== email);
                          });
                        }}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span>
                        {participant.name || participant.email}
                        <span className="ml-1 text-muted-foreground">({participant.email})</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => saveVisibilityMutation.mutate()}
                disabled={saveVisibilityMutation.isPending}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saveVisibilityMutation.isPending ? "Saving..." : "Save visibility"}
              </button>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

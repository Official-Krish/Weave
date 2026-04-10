import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarDays, LoaderCircle, Users, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";
import type { MeetingListItem } from "../types/api";

export function RecordingsPage() {
  const { isAuthenticated } = useAuth();

  const recordingsQuery = useQuery({
    queryKey: ["recordings"],
    queryFn: async () => {
      const response = await http.get<MeetingListItem[]>("/meeting/getAll");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const recordings = recordingsQuery.data ?? [];

  return (
    <section className="motion-rise rounded-[2rem] border border-border/80 bg-card/82 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 sm:p-10">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Recordings
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        One place for processing, playback, and final exports.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        Phase 2 uses current backend endpoints to list your meetings and open a detail page for each recording candidate.
      </p>

      {!isAuthenticated ? (
        <div className="mt-8 rounded-[1.5rem] border border-border bg-secondary/70 p-6">
          <h2 className="text-xl font-semibold text-foreground">Sign in to view recordings</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This page fetches recordings from your authenticated backend session.
          </p>
          <Link
            to="/signin"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Go to sign in
          </Link>
        </div>
      ) : recordingsQuery.isLoading ? (
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading recordings...
        </div>
      ) : recordingsQuery.isError ? (
        <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="inline-flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            {getHttpErrorMessage(recordingsQuery.error, "Could not load recordings.")}
          </p>
        </div>
      ) : recordings.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] border border-border bg-card/94 p-6">
          <h2 className="text-lg font-semibold text-foreground">No meetings found yet</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Create and end a meeting first, then it will appear here.
          </p>
          <Link
            to="/meetings"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Go to meetings
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {recordings.map((meeting, index) => (
            <Link
              key={meeting.id}
              to={`/recordings/${meeting.id}`}
              className={[
                "motion-rise rounded-[1.5rem] border border-border bg-card/94 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-accent/15",
                index % 3 === 1 ? "motion-delay-1" : index % 3 === 2 ? "motion-delay-2" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {meeting.isEnded ? "Ended" : "In progress"}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">
                    {meeting.roomName?.trim() || `Meeting ${meeting.meetingId.slice(0, 8)}`}
                  </h2>
                </div>
                <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
                  {meeting.isEnded ? "Processing" : "Live"}
                </span>
              </div>

              <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
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
                  {new Date(meeting.date).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Download,
  LoaderCircle,
  Lock,
  Mail,
  Play,
  Save,
  Shield,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { RecordingPageResponse } from "@repo/types/api";
import { useAuth } from "../hooks/useAuth";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";
import HLSPlayer from "@/components/VideoPlayer/videoPlayer";

/* ─── Design tokens (matching Weave brand) ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  .weave-recording-root {
    --gold: #f5a623;
    --gold-dim: rgba(245,166,35,0.12);
    --gold-border: rgba(245,166,35,0.18);
    --gold-hover: rgba(245,166,35,0.22);
    --cream: #fff5de;
    --cream-muted: #bfa873;
    --cream-faint: #8d7850;
    --surface: rgba(10,10,10,0.82);
    --surface-raised: rgba(16,14,10,0.88);
    --surface-inner: rgba(6,5,3,0.65);
    --ink: #0a0a08;
    --ink-muted: #4a4840;
    --ink-faint: #7a7870;
    --border-light: rgba(245,166,35,0.10);
    --border-mid: rgba(245,166,35,0.20);
    --shadow-gold: 0 0 0 1px rgba(245,166,35,0.08), 0 8px 32px rgba(0,0,0,0.45);
    --shadow-card: 0 4px 24px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.25);
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-xl: 32px;
    font-family: 'Instrument Sans', system-ui, sans-serif;
    color-scheme: dark light;
  }

  /* Light mode overrides */
  @media (prefers-color-scheme: light) {
    .weave-recording-root {
      --surface: rgba(255,252,244,0.92);
      --surface-raised: rgba(255,249,235,0.96);
      --surface-inner: rgba(255,248,228,0.85);
      --ink: #1a1508;
      --ink-muted: #5a5240;
      --ink-faint: #8a7c60;
      --border-light: rgba(180,120,20,0.10);
      --border-mid: rgba(180,120,20,0.20);
      --shadow-card: 0 4px 24px rgba(120,80,0,0.10), 0 1px 4px rgba(120,80,0,0.08);
      --shadow-gold: 0 0 0 1px rgba(180,120,20,0.10), 0 8px 32px rgba(120,80,0,0.12);
      --cream: #2a1d04;
      --cream-muted: #6a5030;
      --cream-faint: #9a7850;
      --gold-dim: rgba(180,120,20,0.08);
      --gold-border: rgba(180,120,20,0.18);
      --gold-hover: rgba(180,120,20,0.14);
    }
  }

  .wrp-section {
    background: var(--surface);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: 2.5rem;
    box-shadow: var(--shadow-gold);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    animation: wrp-rise 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes wrp-rise {
    from { opacity: 0; transform: translateY(18px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  .wrp-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .wrp-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .wrp-eyebrow::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
    animation: wrp-pulse 2s ease-in-out infinite;
  }

  @keyframes wrp-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .wrp-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 400;
    line-height: 1.15;
    color: var(--cream);
    margin: 0;
    max-width: 36rem;
  }

  .wrp-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1.1rem;
    border-radius: 999px;
    border: 1px solid var(--gold-border);
    background: var(--gold-dim);
    color: var(--cream-muted);
    font-size: 0.78rem;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
    flex-shrink: 0;
  }

  .wrp-back-btn:hover {
    background: var(--gold-hover);
    border-color: rgba(245,166,35,0.35);
    color: var(--cream);
    transform: translateX(-2px);
  }

  /* ── Status states ── */
  .wrp-state-card {
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    border: 1px solid var(--border-light);
    animation: wrp-rise 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s both;
  }

  .wrp-state-card.error {
    background: rgba(180,20,20,0.08);
    border-color: rgba(220,50,50,0.18);
  }

  .wrp-state-card.warning {
    background: rgba(180,100,10,0.08);
    border-color: rgba(245,166,35,0.20);
  }

  .wrp-state-card.info {
    background: var(--surface-raised);
  }

  .wrp-state-title {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--cream);
    margin: 0 0 0.4rem;
  }

  .wrp-state-desc {
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--cream-muted);
    margin: 0 0 1.2rem;
  }

  /* ── Main content card ── */
  .wrp-content-card {
    background: var(--surface-raised);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    box-shadow: var(--shadow-card);
    animation: wrp-rise 0.45s cubic-bezier(0.22,1,0.36,1) 0.08s both;
  }

  /* ── Player wrapper ── */
  .wrp-player-wrap {
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--gold-border);
    background: #000;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,166,35,0.06);
    transition: box-shadow 0.3s;
  }

  .wrp-player-wrap:hover {
    box-shadow: 0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(245,166,35,0.12);
  }

  /* ── Stream badge ── */
  .wrp-stream-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .wrp-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--gold-border);
    background: var(--gold-dim);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: 0.02em;
  }

  .wrp-stream-note {
    font-size: 0.78rem;
    color: var(--cream-faint);
    line-height: 1.5;
  }

  /* ── Info + Sharing sections ── */
  .wrp-panel {
    margin-top: 1.5rem;
    background: var(--surface-inner);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    animation: wrp-rise 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both;
  }

  .wrp-panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--cream);
    margin: 0 0 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .wrp-panel-title svg {
    color: var(--gold);
    opacity: 0.8;
    flex-shrink: 0;
  }

  .wrp-meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .wrp-meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1rem;
    border-radius: var(--radius-sm);
    background: var(--gold-dim);
    border: 1px solid var(--border-light);
    font-size: 0.82rem;
    color: var(--cream-muted);
    transition: border-color 0.2s, background 0.2s;
  }

  .wrp-meta-item:hover {
    border-color: var(--gold-border);
    background: var(--gold-hover);
    color: var(--cream);
  }

  .wrp-meta-item svg {
    color: var(--gold);
    opacity: 0.75;
    flex-shrink: 0;
  }

  /* ── Download button ── */
  .wrp-download-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    padding: 0.65rem 1.25rem;
    border-radius: 999px;
    border: 1px solid var(--gold-border);
    background: var(--gold-dim);
    color: var(--cream);
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  }

  .wrp-download-btn:hover {
    background: var(--gold-hover);
    border-color: rgba(245,166,35,0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(245,166,35,0.15);
  }

  .wrp-download-btn:active {
    transform: translateY(0);
  }

  /* ── Sharing ── */
  .wrp-share-desc {
    font-size: 0.82rem;
    color: var(--cream-faint);
    margin: -0.5rem 0 1rem;
  }

  .wrp-input-row {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .wrp-email-input {
    flex: 1;
    min-width: 180px;
    height: 2.6rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--gold-border);
    background: rgba(0,0,0,0.3);
    color: var(--cream);
    font-size: 0.85rem;
    font-family: inherit;
    padding: 0 0.9rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .wrp-email-input::placeholder { color: var(--cream-faint); }
  .wrp-email-input:focus {
    border-color: rgba(245,166,35,0.5);
    box-shadow: 0 0 0 3px rgba(245,166,35,0.08);
  }

  @media (prefers-color-scheme: light) {
    .wrp-email-input { background: rgba(255,248,228,0.6); }
  }

  .wrp-add-btn {
    height: 2.6rem;
    padding: 0 1.1rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--gold-border);
    background: var(--gold-dim);
    color: var(--cream);
    font-size: 0.82rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    flex-shrink: 0;
  }

  .wrp-add-btn:hover {
    background: var(--gold-hover);
    border-color: rgba(245,166,35,0.4);
  }

  /* ── Email tags ── */
  .wrp-email-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.75rem;
  }

  .wrp-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    border: 1px solid var(--gold-border);
    background: var(--gold-dim);
    font-size: 0.75rem;
    color: var(--gold);
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    animation: wrp-tag-in 0.2s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes wrp-tag-in {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
  }

  .wrp-tag:hover {
    background: rgba(220,50,50,0.12);
    border-color: rgba(220,50,50,0.25);
    color: #ff8080;
  }

  .wrp-tag-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgba(245,166,35,0.15);
    font-size: 9px;
  }

  /* ── Participant checkboxes ── */
  .wrp-participant-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .wrp-participant-label {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.85rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
    background: rgba(0,0,0,0.2);
    font-size: 0.8rem;
    color: var(--cream);
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  @media (prefers-color-scheme: light) {
    .wrp-participant-label { background: rgba(255,248,228,0.5); }
  }

  .wrp-participant-label:hover {
    border-color: var(--gold-border);
    background: var(--gold-dim);
  }

  .wrp-participant-label input[type='checkbox'] {
    width: 15px;
    height: 15px;
    accent-color: var(--gold);
    flex-shrink: 0;
  }

  .wrp-participant-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wrp-participant-email {
    color: var(--cream-faint);
    font-size: 0.72rem;
  }

  /* ── Save button ── */
  .wrp-save-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.1rem;
    padding: 0.65rem 1.25rem;
    border-radius: 999px;
    border: 1px solid var(--gold-border);
    background: var(--gold-dim);
    color: var(--cream);
    font-size: 0.82rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s, opacity 0.2s;
  }

  .wrp-save-btn:hover:not(:disabled) {
    background: var(--gold-hover);
    border-color: rgba(245,166,35,0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(245,166,35,0.12);
  }

  .wrp-save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  /* ── Ask permission button ── */
  .wrp-permission-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.15rem;
    border-radius: 999px;
    border: 1px solid rgba(245,166,35,0.3);
    background: rgba(245,166,35,0.12);
    color: var(--gold);
    font-size: 0.82rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .wrp-permission-btn:hover {
    background: rgba(245,166,35,0.2);
    border-color: rgba(245,166,35,0.45);
  }

  /* ── Loading spinner ── */
  .wrp-loading-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2rem;
    padding: 0.5rem 1.1rem;
    border-radius: 999px;
    border: 1px solid var(--border-light);
    background: var(--surface-raised);
    font-size: 0.82rem;
    color: var(--cream-muted);
  }

  /* ── Sign-in card ── */
  .wrp-signin-card {
    margin-top: 2rem;
    background: var(--surface-raised);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 1.75rem;
    animation: wrp-rise 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }

  .wrp-signin-btn {
    display: inline-flex;
    margin-top: 1.25rem;
    padding: 0.65rem 1.4rem;
    border-radius: 999px;
    background: var(--gold);
    color: #1a0f00;
    font-size: 0.85rem;
    font-weight: 700;
    font-family: inherit;
    text-decoration: none;
    transition: opacity 0.2s, transform 0.15s;
  }

  .wrp-signin-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  /* ── Access info note ── */
  .wrp-access-note {
    padding: 0.7rem 1rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-light);
    background: var(--gold-dim);
    font-size: 0.82rem;
    color: var(--cream-muted);
    margin-top: 1rem;
  }

  /* ── Divider ── */
  .wrp-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-border), transparent);
    margin: 1.5rem 0;
  }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .wrp-section { padding: 1.25rem; }
    .wrp-content-card { padding: 1.1rem; }
    .wrp-panel { padding: 1.1rem; }
  }
`;

/* ─────────────────────────────────────────────────────── */

export function FinalRecordingPage() {
  const { recordingId = "" } = useParams();
  const { isAuthenticated } = useAuth();
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [permissionAlertShown, setPermissionAlertShown] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const meetingQuery = useQuery({
    queryKey: ["final-recording-page", recordingId],
    queryFn: async () => {
      const response = await http.get<RecordingPageResponse>(
        `/meeting/recording/page/${recordingId}`
      );
      return response.data;
    },
    enabled: isAuthenticated && Boolean(recordingId),
  });

  const meeting = meetingQuery.data;
  const startedAt = meeting?.startTime ? new Date(meeting.startTime) : null;
  const endedAt = meeting?.endTime ? new Date(meeting.endTime) : null;

  const durationLabel =
    startedAt && endedAt
      ? `${Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))} min`
      : "Unknown";

  const eligibleParticipants = useMemo(() => {
    const hostEmail = meeting?.hostEmail?.toLowerCase() || "";
    return (meeting?.participants || []).filter((p) => {
      const email = p.email?.toLowerCase() || "";
      return Boolean(email) && email !== hostEmail;
    });
  }, [meeting?.hostEmail, meeting?.participants]);

  useEffect(() => {
    if (meeting?.visibleToEmails) setSelectedEmails(meeting.visibleToEmails);
  }, [meeting?.visibleToEmails]);

  const inputEmail = emailInput.trim().toLowerCase();
  const isEmailInputValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail);

  const addEmailToShare = () => {
    if (!isEmailInputValid) { toast.error("Enter a valid email address"); return; }
    setSelectedEmails((cur) => cur.includes(inputEmail) ? cur : [...cur, inputEmail]);
    setEmailInput("");
  };

  const hlsManifestUrl = meeting?.meetingId
    ? `/api/v1/recordings/${meeting.meetingId}/hls/master.m3u8` : "";
  const thumbnailVttUrl = meeting?.meetingId
    ? `/api/v1/recordings/${meeting.meetingId}/hls/thumbnails.vtt` : "";
  const posterUrl = meeting?.meetingId
    ? `/api/v1/recordings/${meeting.meetingId}/hls/poster.jpg` : "";
  const downloadableMp4Url = meeting?.meetingId
    ? `/api/v1/recordings/${meeting.meetingId}/final/meeting_grid_recording.mp4` : "";

  const canRenderPlayer = Boolean(
    meeting?.canViewRecording && meeting?.recordingState === "READY"
  );

  const hlsAvailabilityQuery = useQuery({
    queryKey: ["hls-availability", meeting?.meetingId],
    enabled: Boolean(canRenderPlayer && hlsManifestUrl),
    retry: false,
    queryFn: async () => {
      const res = await fetch(hlsManifestUrl, { method: "HEAD" });
      return res.ok;
    },
  });

  const saveVisibilityMutation = useMutation({
    mutationFn: async () => {
      await http.put(`/meeting/recording/visibility/${meeting?.meetingId}`, {
        visibleToEmails: selectedEmails,
      });
    },
    onSuccess: () => {
      toast.success("Recording visibility updated");
      meetingQuery.refetch();
    },
    onError: (err) =>
      toast.error(getHttpErrorMessage(err, "Could not save visibility settings")),
  });

  const handleAskPermission = () => {
    const hostEmail = meeting?.hostEmail;
    if (!hostEmail) {
      window.alert("You do not have access to this recording yet. Please ask the host for permission.");
      return;
    }
    window.alert(`You do not have access yet. Please ask ${hostEmail} to add your email in sharing settings.`);
  };

  useEffect(() => {
    if (!meeting || permissionAlertShown) return;
    if (meeting.recordingState !== "READY" || meeting.canViewRecording || meeting.isHost) return;
    handleAskPermission();
    setPermissionAlertShown(true);
  }, [meeting, permissionAlertShown]);

  return (
    <>
      <style>{css}</style>
      <section className="weave-recording-root wrp-section">

        {/* ── Header ── */}
        <div className="wrp-header">
          <div>
            <p className="wrp-eyebrow">Final Recording</p>
          </div>
          <Link to="/dashboard?section=recordings" className="wrp-back-btn">
            <ArrowLeft size={14} />
            Back to recordings
          </Link>
        </div>

        {/* ── Auth gate ── */}
        {!isAuthenticated ? (
          <div className="wrp-signin-card">
            <Lock size={20} style={{ color: "var(--gold)", marginBottom: "0.6rem" }} />
            <h2 className="wrp-state-title">Sign in required</h2>
            <p className="wrp-state-desc">
              You need an authenticated session to open final recordings.
            </p>
            <Link to="/signin" className="wrp-signin-btn">Go to sign in</Link>
          </div>

        ) : meetingQuery.isLoading ? (
          <div className="wrp-loading-pill">
            <LoaderCircle size={15} style={{ animation: "spin 1s linear infinite" }} />
            Loading final recording…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>

        ) : meetingQuery.isError || !meeting ? (
          <div className="wrp-state-card error" style={{ marginTop: "1.5rem" }}>
            <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "#ff8080", margin: 0 }}>
              <AlertCircle size={16} />
              {getHttpErrorMessage(meetingQuery.error, "Could not load final recording.")}
            </p>
          </div>

        ) : (
          <div className="wrp-content-card">

            {/* ── Player / state ── */}
            {meeting.recordingState !== "READY" ? (
              <div className="wrp-state-card info">
                <Video size={20} style={{ color: "var(--gold)", marginBottom: "0.6rem" }} />
                <h2 className="wrp-state-title">Video is preparing</h2>
                <p className="wrp-state-desc">
                  Current status: {meeting.recordingState || "PROCESSING"}. You can stay on this page and retry shortly.
                </p>
              </div>

            ) : !meeting.canViewRecording ? (
              <div className="wrp-state-card warning">
                <Shield size={20} style={{ color: "var(--gold)", marginBottom: "0.6rem" }} />
                <h2 className="wrp-state-title">Access requires host permission</h2>
                <p className="wrp-state-desc">
                  Your email is not in the sharing list yet. Ask the host to add your email in recording sharing settings.
                </p>
                <button type="button" onClick={handleAskPermission} className="wrp-permission-btn">
                  <Mail size={13} />
                  Ask permission from host
                </button>
              </div>

            ) : (
              <div className="wrp-player-wrap">
                <HLSPlayer
                  src={hlsManifestUrl}
                  poster={posterUrl || undefined}
                  thumbnailVtt={hlsAvailabilityQuery.data ? thumbnailVttUrl : undefined}
                  className="w-full"
                />
              </div>
            )}

            {/* ── Stream badge ── */}
            <div className="wrp-stream-row">
              <span className="wrp-badge">
                <Play size={10} />
                {meeting.recordingState === "READY"
                  ? hlsAvailabilityQuery.data ? "HLS streaming" : "Local asset playback"
                  : "Preparing"}
              </span>
              <span className="wrp-stream-note">
                {meeting.recordingState !== "READY"
                  ? "Recording is being processed and will appear when ready."
                  : hlsAvailabilityQuery.data
                  ? "Video is streamed via HLS from our CDN for optimal performance."
                  : "HLS stream is not available yet."}
              </span>
            </div>

            <div className="wrp-divider" />

            {/* ── Recording details ── */}
            <div className="wrp-panel">
              <h2 className="wrp-panel-title">
                <Video size={15} />
                Recording details
              </h2>
              <div className="wrp-meta-grid">
                <div className="wrp-meta-item">
                  <Video size={13} />
                  <span>Room Name: {meeting.roomName}</span>
                </div>
                <div className="wrp-meta-item">
                  <Users size={13} />
                  <span>{meeting.participants.length} participant{meeting.participants.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="wrp-meta-item">
                  <CalendarDays size={13} />
                  <span>{new Date(meeting.date).toLocaleString()}</span>
                </div>
                <div className="wrp-meta-item">
                  <Clock3 size={13} />
                  <span>Duration: {durationLabel}</span>
                </div>
              </div>

              {meeting.recordingState === "READY" && meeting.canViewRecording && (
                <a href={downloadableMp4Url} download className="wrp-download-btn">
                  <Download size={13} />
                  Download recording
                </a>
              )}
            </div>

            {/* ── Sharing ── */}
            <div className="wrp-panel">
              <h2 className="wrp-panel-title">
                <Mail size={15} />
                Sharing
              </h2>
              <p className="wrp-share-desc">
                Add emails to grant recording access.
              </p>

              {meeting.isHost ? (
                <>
                  <div className="wrp-input-row">
                    <input
                      type="email"
                      className="wrp-email-input"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email to share"
                      onKeyDown={(e) => e.key === "Enter" && addEmailToShare()}
                    />
                    <button type="button" onClick={addEmailToShare} className="wrp-add-btn">
                      Add email
                    </button>
                  </div>

                  {selectedEmails.length > 0 && (
                    <div className="wrp-email-tags">
                      {selectedEmails.map((email) => (
                        <button
                          key={email}
                          type="button"
                          className="wrp-tag"
                          onClick={() =>
                            setSelectedEmails((cur) => cur.filter((v) => v !== email))
                          }
                        >
                          {email}
                          <span className="wrp-tag-x"><X size={8} /></span>
                        </button>
                      ))}
                    </div>
                  )}

                  {eligibleParticipants.length > 0 && (
                    <div className="wrp-participant-grid">
                      {eligibleParticipants.map((participant) => {
                        const email = participant.email?.toLowerCase() || "";
                        const checked = selectedEmails.includes(email);
                        return (
                          <label key={participant.id} className="wrp-participant-label">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (!email) return;
                                setSelectedEmails((cur) =>
                                  e.target.checked
                                    ? cur.includes(email) ? cur : [...cur, email]
                                    : cur.filter((i) => i !== email)
                                );
                              }}
                            />
                            <span className="wrp-participant-name">
                              {participant.name || participant.email}
                              <span className="wrp-participant-email">
                                {participant.name ? ` (${participant.email})` : ""}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    className="wrp-save-btn"
                    onClick={() => saveVisibilityMutation.mutate()}
                    disabled={saveVisibilityMutation.isPending}
                  >
                    <Save size={13} />
                    {saveVisibilityMutation.isPending ? "Saving…" : "Save sharing"}
                  </button>
                </>
              ) : (
                <div className="wrp-access-note">
                  {meeting.canViewRecording
                    ? "You currently have access to this recording."
                    : "You do not have access yet. Ask the host for permission."}
                </div>
              )}
            </div>

          </div>
        )}
      </section>
    </>
  );
}
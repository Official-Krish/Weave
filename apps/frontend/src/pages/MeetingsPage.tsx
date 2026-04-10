import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateMeetingForm } from "../components/Meetings/CreateMeetingForm";
import { DevicePreview } from "../components/Meetings/DevicePreview";
import { JoinMeetingForm } from "../components/Meetings/JoinMeetingForm";
import { ModeToggle } from "../components/Meetings/ModeToggle";
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mode, setMode] = useState<"create" | "join">("create");
  const [createRoomName, setCreateRoomName] = useState("");
  const [createPasscode, setCreatePasscode] = useState("");
  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [joinPasscode, setJoinPasscode] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [selectedMicId, setSelectedMicId] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@") || invites.includes(email)) {
      return;
    }
    setInvites((current) => [...current, email]);
    setInviteEmail("");
  };

  const removeInvite = (email: string) => {
    setInvites((current) => current.filter((item) => item !== email));
  };

  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    const loadPreview = async () => {
      try {
        setPreviewError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCameraId
            ? { deviceId: { exact: selectedCameraId } }
            : true,
          audio: selectedMicId
            ? { deviceId: { exact: selectedMicId } }
            : true,
        });

        if (mounted && videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const microphones = devices.filter((device) => device.kind === "audioinput");

        if (mounted) {
          setCameraDevices(cameras);
          setMicDevices(microphones);

          if (!selectedCameraId && cameras[0]?.deviceId) {
            setSelectedCameraId(cameras[0].deviceId);
          }
          if (!selectedMicId && microphones[0]?.deviceId) {
            setSelectedMicId(microphones[0].deviceId);
          }
        }
      } catch {
        if (mounted) {
          setPreviewError("Could not access camera/microphone for preview.");
        }
      }
    };

    void loadPreview();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCameraId, selectedMicId]);

  const createMeetingMutation = useMutation({
    mutationFn: async () => {
      const response = await http.post<CreateMeetingResponse>("/meeting/create", {
        roomName: createRoomName,
        passcode: createPasscode || undefined,
        participants: invites,
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

  const busyLabel = useMemo(() => {
    if (createMeetingMutation.isPending) {
      return "Creating room...";
    }
    if (joinMeetingMutation.isPending) {
      return "Joining room...";
    }
    return null;
  }, [createMeetingMutation.isPending, joinMeetingMutation.isPending]);

  return (
    <section className="rounded-[2rem] border border-border/80 bg-card/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
      <div className="mb-7 text-center">
        <h1 className="text-3xl font-light text-foreground sm:text-5xl">
          Start or join a meeting
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Match the client experience with the same setup flow, wired to your current frontend meeting APIs.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-[1.5rem] border border-border bg-secondary/70 p-6">
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
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <DevicePreview
            videoRef={videoRef}
            cameraDevices={cameraDevices}
            micDevices={micDevices}
            selectedCameraId={selectedCameraId}
            selectedMicId={selectedMicId}
            onCameraChange={setSelectedCameraId}
            onMicChange={setSelectedMicId}
            previewError={previewError}
          />

          <div className="rounded-[1.5rem] border border-border bg-background/40 p-5">
            <ModeToggle mode={mode} onChange={setMode} />

            {mode === "create" ? (
              <CreateMeetingForm
                roomName={createRoomName}
                passcode={createPasscode}
                inviteEmail={inviteEmail}
                invites={invites}
                isBusy={isBusy}
                isPending={createMeetingMutation.isPending}
                onRoomNameChange={setCreateRoomName}
                onPasscodeChange={setCreatePasscode}
                onInviteEmailChange={setInviteEmail}
                onAddInvite={addInvite}
                onRemoveInvite={removeInvite}
                onSubmit={() => {
                  setErrorMessage(null);
                  createMeetingMutation.mutate();
                }}
              />
            ) : (
              <JoinMeetingForm
                meetingId={joinMeetingId}
                passcode={joinPasscode}
                isBusy={isBusy}
                isPending={joinMeetingMutation.isPending}
                onMeetingIdChange={setJoinMeetingId}
                onPasscodeChange={setJoinPasscode}
                onSubmit={() => {
                  setErrorMessage(null);
                  joinMeetingMutation.mutate();
                }}
              />
            )}

            {busyLabel ? (
              <p className="mt-4 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {busyLabel}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {errorMessage ? (
        <p className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}

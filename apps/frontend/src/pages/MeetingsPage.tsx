import { useNavigate } from "react-router-dom";
import {
  CreateMeetingForm,
  DevicePreview,
  JoinMeetingForm,
  ModeToggle,
} from "../components/Meetings";
import { useAuth } from "../hooks/useAuth";
import { useMeetingSetup } from "../hooks/useMeetingSetup";

export function MeetingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, name } = useAuth();
  const {
    videoRef,
    mode,
    setMode,
    createRoomName,
    setCreateRoomName,
    createPasscode,
    setCreatePasscode,
    joinMeetingId,
    setJoinMeetingId,
    joinPasscode,
    setJoinPasscode,
    inviteEmail,
    setInviteEmail,
    invites,
    cameraDevices,
    micDevices,
    selectedCameraId,
    setSelectedCameraId,
    selectedMicId,
    setSelectedMicId,
    previewError,
    errorMessage,
    addInvite,
    removeInvite,
    createMeetingMutation,
    joinMeetingMutation,
    isBusy,
    busyLabel,
    submitCreate,
    submitJoin,
  } = useMeetingSetup({
    displayNameFallback: name || "",
    navigate,
  });

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
                onSubmit={submitCreate}
              />
            ) : (
              <JoinMeetingForm
                meetingId={joinMeetingId}
                passcode={joinPasscode}
                isBusy={isBusy}
                isPending={joinMeetingMutation.isPending}
                onMeetingIdChange={setJoinMeetingId}
                onPasscodeChange={setJoinPasscode}
                onSubmit={submitJoin}
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

import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { http } from "../https";
import { getHttpErrorMessage } from "../lib/httpError";
import type { CreateMeetingResponse, JoinMeetingResponse } from "../types/api";

type UseMeetingSetupArgs = {
  displayNameFallback: string;
  navigate: (path: string) => void;
};

export function useMeetingSetup({ displayNameFallback, navigate }: UseMeetingSetupArgs) {
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
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPreviewError("Media device APIs are not available in this browser.");
      return;
    }

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
          data.name || displayNameFallback || "Host"
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
          data.name || displayNameFallback || "Guest"
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

  const isBusy = createMeetingMutation.isPending || joinMeetingMutation.isPending;

  const busyLabel = useMemo(() => {
    if (createMeetingMutation.isPending) {
      return "Creating room...";
    }
    if (joinMeetingMutation.isPending) {
      return "Joining room...";
    }
    return null;
  }, [createMeetingMutation.isPending, joinMeetingMutation.isPending]);

  const submitCreate = () => {
    setErrorMessage(null);
    createMeetingMutation.mutate();
  };

  const submitJoin = () => {
    setErrorMessage(null);
    joinMeetingMutation.mutate();
  };

  return {
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
    setErrorMessage,
    addInvite,
    removeInvite,
    createMeetingMutation,
    joinMeetingMutation,
    isBusy,
    busyLabel,
    submitCreate,
    submitJoin,
  };
}

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { http } from "../https";
import type { RecordingStatusResponse } from "@repo/types/api";

type ConnectionState = "idle" | "loading-lib" | "connecting" | "connected" | "failed";

type UseMeetingRecordingArgs = {
  meetingId: string;
  roomName: string;
  localParticipantId: string | null;
  connectionState: ConnectionState;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
};

export function useMeetingRecording({
  meetingId,
  roomName,
  localParticipantId,
  connectionState,
  isRecording,
  setIsRecording,
}: UseMeetingRecordingArgs) {
  const CHUNK_DURATION_MS = 5000;

  const [isUploadingChunks, setIsUploadingChunks] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recorderStartingRef = useRef(false);
  const sequenceRef = useRef(0);
  const uploadChainRef = useRef<Promise<void>>(Promise.resolve());

  const recordingStatusQuery = useQuery<RecordingStatusResponse>({
    queryKey: ["recording-status", meetingId],
    enabled: Boolean(meetingId),
    queryFn: async () => {
      const { data } = await http.get(`/meeting/recording/status/${meetingId}`);
      return data;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!recordingStatusQuery.data) {
      return;
    }

    const serverState = recordingStatusQuery.data.recordingState;
    setIsRecording(serverState === "RECORDING");
  }, [recordingStatusQuery.data, setIsRecording]);

  const enqueueChunkUpload = useCallback((chunk: Blob) => {
    const meetingKey = roomName;

    if (!meetingKey) {
      return;
    }

    const nextSequence = sequenceRef.current++;
    const startedAt = new Date().toISOString();

    uploadChainRef.current = uploadChainRef.current.then(async () => {
      const formData = new FormData();
      formData.append("video", chunk, `chunk-${nextSequence}.webm`);
      formData.append("meetingId", meetingKey);
      if (localParticipantId) {
        formData.append("participantId", localParticipantId);
      }
      formData.append("sequenceNumber", String(nextSequence));
      formData.append("startedAt", startedAt);
      formData.append("durationMs", String(CHUNK_DURATION_MS));
      formData.append("mimeType", chunk.type || "video/webm");

      await http.post("/upload-chunk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    });
  }, [roomName, localParticipantId]);

  const getSupportedMimeType = useCallback(() => {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "video/webm";
  }, []);

  const cleanupRecorder = useCallback(() => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // best effort
    }
    mediaRecorderRef.current = null;

    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // best effort
        }
      });
      recordingStreamRef.current = null;
    }
  }, []);

  const startLocalChunkRecorder = useCallback(async () => {
    if (mediaRecorderRef.current || recorderStartingRef.current) {
      return;
    }

    recorderStartingRef.current = true;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Media capture is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      recordingStreamRef.current = stream;

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType: getSupportedMimeType(),
        });
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (!event.data || event.data.size === 0) {
          return;
        }
        setIsUploadingChunks(true);
        enqueueChunkUpload(event.data);
      };

      recorder.onerror = () => {
        setRecordingError("Chunk recorder failed while capturing meeting.");
      };

      recorder.onstop = async () => {
        await uploadChainRef.current;
        setIsUploadingChunks(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(CHUNK_DURATION_MS);
    } finally {
      recorderStartingRef.current = false;
    }
  }, [enqueueChunkUpload, getSupportedMimeType]);

  const stopLocalChunkRecorder = useCallback(async () => {
    cleanupRecorder();
    await uploadChainRef.current;
    setIsUploadingChunks(false);
  }, [cleanupRecorder]);

  const startRecordingMutation = useMutation({
    mutationFn: async () => {
      await http.post(`/meeting/recording/start/${meetingId}`);
      sequenceRef.current = 0;
      uploadChainRef.current = Promise.resolve();
      await startLocalChunkRecorder();
    },
    onSuccess: () => {
      setRecordingError(null);
      setIsRecording(true);
      recordingStatusQuery.refetch();
    },
    onError: () => {
      cleanupRecorder();
      setRecordingError("Could not start recording. Check permissions and try again.");
      setIsRecording(false);
    },
  });

  const stopRecordingMutation = useMutation({
    mutationFn: async () => {
      await stopLocalChunkRecorder();
      await http.post(`/meeting/recording/stop/${meetingId}`);
    },
    onSuccess: () => {
      setIsRecording(false);
      recordingStatusQuery.refetch();
    },
    onError: () => {
      setRecordingError("Could not stop recording cleanly.");
    },
  });

  useEffect(() => {
    return () => {
      cleanupRecorder();
    };
  }, [cleanupRecorder]);

  useEffect(() => {
    const serverState = recordingStatusQuery.data?.recordingState;
    if (!serverState || connectionState !== "connected") {
      return;
    }

    const shouldRecord = serverState === "RECORDING";

    if (shouldRecord) {
      startLocalChunkRecorder().catch(() => {
        setRecordingError("Could not start local recording. Please allow camera and microphone permission.");
      });
      return;
    }

    if (mediaRecorderRef.current) {
      void stopLocalChunkRecorder();
    }
  }, [connectionState, recordingStatusQuery.data?.recordingState, startLocalChunkRecorder, stopLocalChunkRecorder]);

  const isRecordingBusy = startRecordingMutation.isPending || stopRecordingMutation.isPending;
  const recordingButtonLabel = stopRecordingMutation.isPending
    ? "Stopping..."
    : startRecordingMutation.isPending
      ? "Starting..."
      : isRecording
        ? "Stop recording"
        : "Start recording";

  return {
    isUploadingChunks,
    recordingError,
    startRecordingMutation,
    stopRecordingMutation,
    isRecordingBusy,
    recordingButtonLabel,
    stopLocalChunkRecorder,
    hasActiveRecorder: () => Boolean(mediaRecorderRef.current),
  };
}

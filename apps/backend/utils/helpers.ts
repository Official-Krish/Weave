import { prisma } from "@repo/db/client";
import path from "node:path";
import { redisPublisher } from "./redis";

export const recordingsRoot = path.resolve(process.cwd(), "../../recordings");

export function toSingleString(value: string | string[] | undefined): string | null {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value) && value.length > 0) {
        return value[0] ?? null;
    }

    return null;
}

export const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateString() {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < 20; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export async function getMeetingSessions(roomId: string) {
    return prisma.meeting.findMany({
        where: {
            roomId: roomId,
        },
        include: {
            finalRecording: true,
        }
    });
}

export async function getUserMeetingSession(roomId: string, userId: string) {
    return prisma.meeting.findFirst({
        where: {
            roomId: roomId,
            userId,
        },
        include: {
            finalRecording: true,
        }
    });
}

export function canViewFinalRecording(args: {
    isHost: boolean;
    userEmail: string | null;
    visibleToEmails: string[];
}) {
    if (args.isHost) {
        return true;
    }

    if (!args.userEmail) {
        return false;
    }

    return args.visibleToEmails.includes(args.userEmail);
}

export function normalizeEmails(values: unknown): string[] {
    if (!Array.isArray(values)) {
        return [];
    }

    const normalized = values
        .map((value) => (typeof value === "string" ? value.trim().toLowerCase() : ""))
        .filter((email) => Boolean(email) && email.includes("@"));

    return [...new Set(normalized)];
}

export function normalizeFinalRecordingLinks<T extends { videoLink: string }>(recordings: T[]): T[] {
    return recordings.map((recording) => {
        const videoLink = recording.videoLink || "";

        if (videoLink.startsWith("/api/v1/recordings/")) {
            return recording;
        }

        const normalizedRelative = path.relative(recordingsRoot, videoLink).split(path.sep).join("/");
        if (!normalizedRelative || normalizedRelative.startsWith("..")) {
            return recording;
        }

        return {
            ...recording,
            videoLink: `/api/v1/recordings/${normalizedRelative}`,
        };
    });
}

export function normalizeFinalRecordingLink<T extends { videoLink: string }>(recording: T | null | undefined): T | null {
    if (!recording) {
        return null;
    }

    const videoLink = recording.videoLink || "";

    if (videoLink.startsWith("/api/v1/recordings/")) {
        return recording;
    }

    const normalizedRelative = path.relative(recordingsRoot, videoLink).split(path.sep).join("/");
    if (!normalizedRelative || normalizedRelative.startsWith("..")) {
        return recording;
    }

    return {
        ...recording,
        videoLink: `/api/v1/recordings/${normalizedRelative}`,
    };
}

export function toPublicRecordingLink(localPath: string) {
  const normalizedRelative = path.relative(recordingsRoot, localPath).split(path.sep).join("/");
  if (!normalizedRelative || normalizedRelative.startsWith("..")) {
    return localPath;
  }

  return `/api/v1/recordings/${normalizedRelative}`;
}

export function sanitizePathSegment(value: unknown) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  return /^[a-zA-Z0-9._-]+$/.test(text) ? text : null;
}

export function getFileExtension(mimeType?: string) {
  if (!mimeType) {
    return "webm";
  }

  if (mimeType.includes("webm")) {
    return "webm";
  }

  if (mimeType.includes("mp4")) {
    return "mp4";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  return "webm";
}

export async function finalizeMeetingRoom(roomId: string, hostUserId?: string) {
    const meetings = await getMeetingSessions(roomId);

    if (meetings.length === 0) {
        const error = new Error("Meeting not found");
        (error as Error & { statusCode?: number }).statusCode = 404;
        throw error;
    }

    const hostMeeting = meetings.find((meeting) => meeting.isHost);

    if (!hostMeeting) {
        const error = new Error("Host meeting not found");
        (error as Error & { statusCode?: number }).statusCode = 404;
        throw error;
    }

    if (hostUserId && hostMeeting.userId !== hostUserId) {
        const error = new Error("Only host can end this meeting");
        (error as Error & { statusCode?: number }).statusCode = 403;
        throw error;
    }

    const alreadyEnded = meetings.every((meeting) => meeting.isEnded);
    const endTime = new Date();
    const shouldProcessRecording = hostMeeting.recordingState === "RECORDING" || hostMeeting.recordingState === "UPLOADING" ||hostMeeting. recordingState === "PROCESSING";

    if (!alreadyEnded) {
        await prisma.meeting.updateMany({
            where: {
                roomId: hostMeeting.roomId,
            },
            data: {
                isEnded: true,
                endTime,
                recordingState: shouldProcessRecording ? "PROCESSING" : "IDLE",
                recordingStoppedAt: shouldProcessRecording ? endTime : undefined,
                processingStartedAt: shouldProcessRecording ? endTime : null,
            },
        });

        if (shouldProcessRecording) {
            await redisPublisher.rpush("ProcessVideo", JSON.stringify({
                meetingId: roomId,
            }));
        }
    }

    return {
        meeting: hostMeeting,
        participants: hostMeeting.joinedParticipants.length,
        duration: hostMeeting.startTime
            ? Math.max(0, Math.floor((endTime.getTime() - hostMeeting.startTime.getTime()) / 60000))
            : 0,
        alreadyEnded,
        shouldProcessRecording,
    };
}
import { prisma } from "@repo/db/client";
import path from "node:path";

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
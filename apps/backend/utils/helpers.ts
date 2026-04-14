import { prisma } from "@repo/db/client";
import path from "node:path";

const recordingsRoot = path.resolve(process.cwd(), "../../recordings");

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

export async function getMeetingSessions(meetingId: string) {
    return prisma.meeting.findMany({
        where: {
            meetingId,
        },
        include: {
            finalRecording: true,
        }
    });
}

export async function getUserMeetingSession(meetingId: string, userId: string) {
    return prisma.meeting.findFirst({
        where: {
            meetingId,
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

export function normalizeFinalRecordingLinks<T extends { VideoLink: string }>(recordings: T[]): T[] {
    return recordings.map((recording) => {
        const videoLink = recording.VideoLink || "";

        if (videoLink.startsWith("/api/v1/recordings/")) {
            return recording;
        }

        const normalizedRelative = path.relative(recordingsRoot, videoLink).split(path.sep).join("/");
        if (!normalizedRelative || normalizedRelative.startsWith("..")) {
            return recording;
        }

        return {
            ...recording,
            VideoLink: `/api/v1/recordings/${normalizedRelative}`,
        };
    });
}
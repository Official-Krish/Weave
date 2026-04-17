import { prisma } from "@repo/db/client";
import { toPublicRecordingLink } from "./helpers";

export async function handleProcessingStatus(meetingId: string) {
    await prisma.meeting.updateMany({
        where: { roomId: meetingId },
        data: {
            recordingState: "PROCESSING",
            processingStartedAt: new Date(),
            processingEndedAt: null,
        },
    });
}

export async function handleFailedStatus(meetingId: string) {
    const meeting = await getMeetingByRoomId(meetingId);

    await prisma.$transaction([
        prisma.meeting.updateMany({
            where: { roomId: meetingId },
            data: {
                recordingState: "FAILED",
                processingEndedAt: new Date(),
            },
        }),
        prisma.notification.create({
            data: {
                userId: meeting.userId,
                type: "RECORDING_FAILED",
                message: `Recording for meeting "${meeting.roomName}" has failed to process.`,
                metadata: { roomId: meeting.roomId },
                createdAt: new Date(),
            },
        }),
    ]);
}

export async function handleReadyStatus(meetingId: string, finalPath: string) {
    const meeting = await getMeetingByRoomId(meetingId);
    const publicFinalPath = toPublicRecordingLink(finalPath);

    await prisma.$transaction([
        prisma.finalRecording.upsert({
            where: { meetingId: meeting.id },
            create: {
                meetingId: meeting.id,
                videoLink: publicFinalPath,
                visibleToEmails: [],
            },
            update: {
                videoLink: publicFinalPath,
            },
        }),
        prisma.meeting.updateMany({
            where: { roomId: meetingId },
            data: {
                recordingState: "READY",
                processingEndedAt: new Date(),
            },
        }),
        prisma.notification.create({
            data: {
                userId: meeting.userId,
                type: "RECORDING_READY",
                message: `Recording for meeting "${meeting.roomName}" is ready.`,
                metadata: { roomId: meeting.roomId, recordingLink: publicFinalPath },
                createdAt: new Date(),
            },
        }),
    ]);
}

async function getMeetingByRoomId(meetingId: string) {
    const meeting = await prisma.meeting.findFirst({
        where: { roomId: meetingId, isHost: true },
        orderBy: { date: "asc" },
    });

    if (!meeting) {
        const error = new Error("Meeting not found");
        (error as any).statusCode = 404;
        throw error;
    }

    return meeting;
}
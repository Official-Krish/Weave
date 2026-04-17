import path from "path";
import fs from "fs/promises";
import { prisma } from "@repo/db/client";
import { sanitizePathSegment, getFileExtension } from "./helpers";
import { recordingsRoot } from "./helpers";

interface UploadChunkParams {
  fileBuffer: Buffer;
  fileMimeType: string;
  meetingId: string;
  userId: string;
  rawParticipantId?: string;
  sequenceNumber: number | null;
  startedAt: Date | null;
  durationMs: number | null;
  mimeType: string;
}

export async function uploadChunk({
  fileBuffer,
  meetingId: roomId,
  userId,
  rawParticipantId,
  sequenceNumber,
  startedAt,
  durationMs,
  mimeType,
}: UploadChunkParams) {
  const participantId =
    sanitizePathSegment(rawParticipantId) || sanitizePathSegment(userId);

  if (!participantId) {
    const error = new Error("Invalid participant identity");
    (error as any).statusCode = 400;
    throw error;
  }

  const outputPath = buildChunkOutputPath({
    roomId,
    participantId,
    mimeType,
    sequenceNumber,
    startedAt,
  });

  await writeChunkToDisk(outputPath, fileBuffer);

  const meeting = await resolveOrCreateMeetingSession(roomId, userId);

  await prisma.mediaChunks.create({
    data: {
      meetingId: meeting.id,
      bucketLink: outputPath,
      mimeType,
      uploaderUserId: userId,
      sequenceNumber: toValidNumber(sequenceNumber),
      durationMs: toValidNumber(durationMs),
      startedAt: startedAt && !Number.isNaN(startedAt.getTime()) ? startedAt : null,
      status: "UPLOADED",
    },
  });

  return outputPath;
}

function buildChunkOutputPath({
  roomId,
  participantId,
  mimeType,
  sequenceNumber,
  startedAt,
}: {
  roomId: string;
  participantId: string;
  mimeType: string;
  sequenceNumber: number | null;
  startedAt: Date | null;
}) {
  const extension = getFileExtension(mimeType);
  const timestamp = (startedAt ?? new Date())
    .toISOString()
    .replace(/[:.]/g, "-");

  const chunkSuffix =
    sequenceNumber !== null && !Number.isNaN(sequenceNumber)
      ? `${String(sequenceNumber).padStart(6, "0")}-${timestamp}`
      : timestamp;

  const relativeChunkPath = path.join(
    roomId,
    "raw",
    "users",
    participantId,
    `chunk-${chunkSuffix}.${extension}`
  );

  return path.join(recordingsRoot, relativeChunkPath);
}

async function writeChunkToDisk(outputPath: string, buffer: Buffer) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
}

async function resolveOrCreateMeetingSession(roomId: string, userId: string) {
  const existing = await prisma.meeting.findFirst({ where: { roomId, userId } });
  if (existing) return existing;

  return createParticipantSession(roomId, userId);
}

async function createParticipantSession(roomId: string, userId: string) {
  const [hostSession, uploader] = await Promise.all([
    prisma.meeting.findFirst({ where: { roomId, isHost: true } }),
    prisma.user.findFirst({ where: { id: userId }, select: { email: true } }),
  ]);

  if (!hostSession || !uploader?.email) {
    console.warn(
      `Meeting session not found for uploaded chunk: roomId=${roomId}, userId=${userId}`
    );
    const error = new Error("Meeting session not found for uploader");
    (error as any).statusCode = 404;
    throw error;
  }

  const normalizedEmail = uploader.email.toLowerCase();
  const mergedParticipants = {
    joined: [...new Set([...hostSession.joinedParticipants, normalizedEmail])],
    invited: [...new Set([...hostSession.invitedParticipants, normalizedEmail])],
  };

  const [createdSession] = await prisma.$transaction([
    prisma.meeting.create({
      data: {
        roomId: hostSession.roomId,
        userId,
        roomName: hostSession.roomName,
        date: hostSession.date,
        startTime: hostSession.startTime,
        endTime: hostSession.endTime,
        isHost: false,
        recordingState: hostSession.recordingState,
        joinedParticipants: mergedParticipants.joined,
        invitedParticipants: mergedParticipants.invited,
      },
    }),
    prisma.meeting.updateMany({
      where: { roomId: hostSession.roomId },
      data: {
        joinedParticipants: mergedParticipants.joined,
        invitedParticipants: mergedParticipants.invited,
      },
    }),
  ]);

  return createdSession;
}

function toValidNumber(value: number | null): number | null {
  return value !== null && !Number.isNaN(value) ? value : null;
}
import { Router } from "express";
import type { Request } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { authMiddleware, serviceAuthMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";
import { workerRecordingStatusSchema } from "@repo/types";

const workerRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const recordingsRoot = path.resolve(process.cwd(), "../../recordings");

function toPublicRecordingLink(localPath: string) {
  const normalizedRelative = path.relative(recordingsRoot, localPath).split(path.sep).join("/");
  if (!normalizedRelative || normalizedRelative.startsWith("..")) {
    return localPath;
  }

  return `/api/v1/recordings/${normalizedRelative}`;
}

function sanitizePathSegment(value: unknown) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  return /^[a-zA-Z0-9._-]+$/.test(text) ? text : null;
}

function getFileExtension(mimeType?: string) {
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

workerRouter.post("/upload-chunk", authMiddleware, upload.single("video"), async (req, res) => {
  if (!req.file || !req.body.meetingId) {
    res.status(400).json({ message: "Missing file or meetingId" });
    return;
  }

  try {
    const roomId = String(req.body.meetingId);
    const userId = req.userId;
    const participantId = sanitizePathSegment(req.body.participantId) || sanitizePathSegment(userId);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!participantId) {
      res.status(400).json({ message: "Invalid participant identity" });
      return;
    }

    const sequenceNumber = req.body.sequenceNumber ? Number(req.body.sequenceNumber) : null;
    const startedAt = req.body.startedAt ? new Date(req.body.startedAt) : null;
    const durationMs = req.body.durationMs ? Number(req.body.durationMs) : null;
    const mimeType = String(req.body.mimeType || req.file.mimetype || "video/webm");
    const extension = getFileExtension(mimeType);
    const timestamp = startedAt
      ? startedAt.toISOString().replace(/[:.]/g, "-")
      : new Date().toISOString().replace(/[:.]/g, "-");

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

    const outputPath = path.join(recordingsRoot, relativeChunkPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, req.file.buffer);

    let meeting = await prisma.meeting.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!meeting) {
      const [hostSession, uploader] = await Promise.all([
        prisma.meeting.findFirst({
          where: {
            roomId,
            isHost: true,
          },
        }),
        prisma.user.findFirst({
          where: { id: userId },
          select: { email: true },
        }),
      ]);

      if (!hostSession || !uploader?.email) {
        console.warn(`Meeting session not found for uploaded chunk: roomId=${roomId}, userId=${userId}`);
        res.status(404).json({ message: "Meeting session not found for uploader" });
        return;
      }

      const normalizedEmail = uploader.email.toLowerCase();

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
            joinedParticipants: [...new Set([...hostSession.joinedParticipants, normalizedEmail])],
            invitedParticipants: [...new Set([...hostSession.invitedParticipants, normalizedEmail])],
          },
        }),
        prisma.meeting.updateMany({
          where: { roomId: hostSession.roomId },
          data: {
            joinedParticipants: [...new Set([...hostSession.joinedParticipants, normalizedEmail])],
            invitedParticipants: [...new Set([...hostSession.invitedParticipants, normalizedEmail])],
          },
        }),
      ]);

      meeting = createdSession;
    }

    await prisma.mediaChunks.create({
      data: {
        meetingId: meeting.id,
        bucketLink: outputPath,
        mimeType,
        uploaderUserId: userId,
        sequenceNumber: sequenceNumber !== null && !Number.isNaN(sequenceNumber) ? sequenceNumber : null,
        durationMs: durationMs !== null && !Number.isNaN(durationMs) ? durationMs : null,
        startedAt: startedAt && !Number.isNaN(startedAt.getTime()) ? startedAt : null,
        status: "UPLOADED",
      },
    });

    res.status(200).json({
      message: "Chunk uploaded successfully",
      path: outputPath,
    });
  } catch (error) {
    console.error("Upload chunk error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

workerRouter.post("/worker/recording-status/:meetingId", serviceAuthMiddleware, async (req, res) => {
  const parsedData = workerRecordingStatusSchema.safeParse({
    meetingId: req.params.meetingId,
    status: req.body?.status,
    finalPath: req.body?.finalPath,
  });

  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid request body", errors: parsedData.error.errors });
    return;
  }

  const meetingId = parsedData.data.meetingId;
  const status = parsedData.data.status;
  const finalPath = parsedData.data.finalPath;

  if (!meetingId) {
    res.status(400).json({ message: "Missing meetingId" });
    return;
  }

  if (!["PROCESSING", "READY", "FAILED"].includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  try {
    const meeting = await prisma.meeting.findFirst({
      where: { roomId: meetingId },
      orderBy: { date: "asc" },
    });

    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    if (status === "PROCESSING") {
      await prisma.meeting.updateMany({
        where: { roomId: meetingId },
        data: {
          recordingState: "PROCESSING",
          processingStartedAt: new Date(),
          processingEndedAt: null,
        },
      });

      res.status(200).json({ message: "Processing status updated" });
      return;
    }

    if (status === "FAILED") {
      await prisma.meeting.updateMany({
        where: { roomId: meetingId },
        data: {
          recordingState: "FAILED",
          processingEndedAt: new Date(),
        },
      });

      res.status(200).json({ message: "Failure status updated" });
      return;
    }

    if (!finalPath) {
      res.status(400).json({ message: "finalPath is required for READY status" });
      return;
    }

    const publicFinalPath = toPublicRecordingLink(finalPath);

    await prisma.finalRecording.upsert({
      where: {
        meetingId: meeting.id,
      },
      create: {
        meetingId: meeting.id,
        videoLink: publicFinalPath,
        visibleToEmails: [],
      },
      update: {
        videoLink: publicFinalPath,
      },
    });

    await prisma.meeting.updateMany({
      where: { roomId: meetingId },
      data: {
        recordingState: "READY",
        processingEndedAt: new Date(),
      },
    });

    res.status(200).json({ message: "Ready status updated" });
  } catch (error) {
    console.error("Worker status callback error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default workerRouter;

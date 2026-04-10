import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { authMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";

const workerRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const recordingsRoot = path.resolve(process.cwd(), "../../recordings");

type WorkerRecordingState = "PROCESSING" | "READY" | "FAILED";

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

workerRouter.post("/worker/recording-status/:meetingId", async (req, res) => {
    console.log("Received recording status update from worker", {
        meetingId: req.params.meetingId,
        status: req.body?.status,
        finalPath: req.body?.finalPath,
    });
  const meetingId = req.params.meetingId;
  const status = String(req.body?.status || "") as WorkerRecordingState;
  const finalPath = req.body?.finalPath ? String(req.body.finalPath) : null;

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
      where: { meetingId },
    });

    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    if (status === "PROCESSING") {
      await prisma.meeting.updateMany({
        where: { meetingId },
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
        where: { meetingId },
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

    const existingFinal = await prisma.finalRecording.findFirst({
      where: {
        meetingId: meeting.id,
        VideoLink: finalPath,
      },
    });

    if (!existingFinal) {
      await prisma.finalRecording.create({
        data: {
          meetingId: meeting.id,
          VideoLink: finalPath,
          format: "MP4",
          quality: "HIGH",
        },
      });
    }

    await prisma.meeting.updateMany({
      where: { meetingId },
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

workerRouter.post("/upload-chunk", authMiddleware, upload.single("video"), async (req, res) => {
    console.log("Received chunk upload request", {
        meetingId: req.body.meetingId,
        durationMs: req.body.durationMs,
        userId: req.userId,
    participantId: req.body.participantId,
    });
  if (!req.file || !req.body.meetingId) {
    res.status(400).json({ message: "Missing file or meetingId" });
    return;
  }

  try {
    const meetingId = String(req.body.meetingId);
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
      meetingId,
      "raw",
      "users",
      participantId,
      `chunk-${chunkSuffix}.${extension}`
    );

    const outputPath = path.join(recordingsRoot, relativeChunkPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, req.file.buffer);

    const meeting = await prisma.meeting.findFirst({
      where: { meetingId },
    });

    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
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

    // GCP upload flow retained for future use (intentionally commented, not removed).
    // const storage = new Storage({ projectId: process.env.PROJECT_ID });
    // const bucket = storage.bucket(process.env.BUCKET_NAME!);
    // await bucket.file(`weave/${meetingId}/raw/users/${userId}/chunk-${chunkSuffix}.${extension}`).save(req.file.buffer, {
    //   metadata: { contentType: req.file.mimetype },
    // });

    res.status(200).json({
      message: "Chunk uploaded successfully",
      path: outputPath,
    });
  } catch (error) {
    console.error("Upload chunk error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

workerRouter.post("/final-upload/:meetingId", async (req, res) => {
    console.log("Received final upload request for meeting", {
        meetingId: req.params.meetingId,
    });
  const meetingId = req.params.meetingId;

  if (!meetingId) {
    res.status(400).json({ message: "Missing meetingId" });
    return;
  }

  try {
    const meeting = await prisma.meeting.findFirst({
      where: { meetingId },
    });

    if (!meeting) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    const localFinalPath = path.join(
      recordingsRoot,
      "final",
      meetingId,
      "meeting_grid_recording.mp4"
    );

    await prisma.finalRecording.create({
      data: {
        meetingId: meeting.id,
        VideoLink: localFinalPath,
        format: "MP4",
        quality: "HIGH",
      },
    });

    await prisma.meeting.updateMany({
      where: {
        meetingId,
      },
      data: {
        recordingState: "READY",
        processingEndedAt: new Date(),
      },
    });

    // GCP final-upload flow retained for future use (intentionally commented, not removed).
    // const videoUrl = `https://assets.krishdev.xyz/weave/${meetingId}/processed/video/meeting_grid_recording.mp4`;

    res.status(200).json({
      message: "Final recording finalized successfully",
      path: localFinalPath,
    });
  } catch (error) {
    console.error("Final upload error:", error);
    await prisma.meeting.updateMany({
      where: {
        meetingId,
      },
      data: {
        recordingState: "FAILED",
      },
    });
    res.status(500).json({ message: "Final upload failed" });
  }
});

export default workerRouter;

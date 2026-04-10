import { Router } from "express";
import type { Request } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { authMiddleware } from "../utils/authMiddleware";
import { prisma } from "@repo/db/client";

const workerRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

const recordingsRoot = path.resolve(process.cwd(), "../../recordings");

type WorkerRecordingState = "PROCESSING" | "READY" | "FAILED";

function hasValidWorkerToken(req: Request) {
  const requiredToken = process.env.WORKER_CALLBACK_TOKEN;
  if (!requiredToken) {
    return true;
  }

  const token = req.headers["x-worker-token"];
  return typeof token === "string" && token === requiredToken;
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

workerRouter.post("/worker/recording-status/:meetingId", async (req, res) => {
  if (!hasValidWorkerToken(req)) {
    res.status(401).json({ message: "Unauthorized worker callback" });
    return;
  }

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
          visibleToEmails: [],
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
  if (!hasValidWorkerToken(req)) {
    res.status(401).json({ message: "Unauthorized worker callback" });
    return;
  }

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
            meetingId,
            "final",
            "meeting_grid_recording.mp4"
        );

        const existingFinal = await prisma.finalRecording.findFirst({
          where: {
            meetingId: meeting.id,
            VideoLink: localFinalPath,
          },
        });

        if (!existingFinal) {
          await prisma.finalRecording.create({
            data: {
              meetingId: meeting.id,
              VideoLink: localFinalPath,
              visibleToEmails: [],
              format: "MP4",
              quality: "HIGH",
            },
          });
        }

        await prisma.meeting.updateMany({
            where: {
                meetingId,
            },
            data: {
                recordingState: "READY",
                processingEndedAt: new Date(),
            },
        });

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

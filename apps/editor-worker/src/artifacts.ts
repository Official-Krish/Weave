import * as path from "node:path";
import * as fs from "node:fs/promises";
import { prisma } from "@repo/db/client";
import { publishConnection } from "./redis";
import { CONFIG } from "./config";
import { log } from "./logger";
import { recordingsRoot, ensureDir } from "./helpers";

export function getCanonicalFinalDir(roomId: string) {
  return path.join(recordingsRoot, roomId, "final");
}

export function getCanonicalFinalPath(roomId: string) {
  return path.join(getCanonicalFinalDir(roomId), "meeting_grid_recording.mp4");
}

export function getCanonicalHlsDir(roomId: string) {
  return path.join(recordingsRoot, roomId, "hls");
}

export async function removeIfExists(targetPath: string) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

export async function promoteRenderedVideo(roomId: string, renderedPath: string) {
  const finalDir = getCanonicalFinalDir(roomId);
  const finalPath = getCanonicalFinalPath(roomId);

  await ensureDir(finalDir);
  await removeIfExists(finalPath);
  await fs.rename(renderedPath, finalPath);

  return finalPath;
}

export async function refreshMeetingRecordingArtifacts(roomId: string, finalPath: string, jobId: string, projectId: string) {
  const publicFinalPath = path.relative(recordingsRoot, finalPath);
  const normalizedPublicFinalPath = publicFinalPath.startsWith("..")
    ? finalPath
    : `/api/v1/recordings/${publicFinalPath.split(path.sep).join("/")}`;

  await removeIfExists(getCanonicalHlsDir(roomId));

  const hostMeeting = await prisma.meeting.findFirst({
    where: {
      roomId,
      isHost: true,
    },
    include: {
      finalRecording: true,
    },
  });

  if (!hostMeeting) {
    throw new Error(`Host meeting not found for room ${roomId}`);
  }

  await prisma.$transaction([
    prisma.exportJob.update({
      where: { id: jobId },
      data: {
        status: "DONE",
        outputUrl: normalizedPublicFinalPath,
        progress: 100,
        error: null,
      },
    }),
    prisma.editorProject.update({
      where: { id: projectId },
      data: { status: "COMPLETED" },
    }),
    prisma.finalRecording.upsert({
      where: {
        meetingId: hostMeeting.id,
      },
      create: {
        meetingId: hostMeeting.id,
        videoLink: normalizedPublicFinalPath,
        visibleToEmails: hostMeeting.finalRecording?.visibleToEmails ?? [],
      },
      update: {
        videoLink: normalizedPublicFinalPath,
      },
    }),
    prisma.meeting.updateMany({
      where: {
        roomId,
      },
      data: {
        recordingState: "PROCESSING",
        processingStartedAt: new Date(),
        processingEndedAt: null,
      },
    }),
  ]);

  await publishConnection.rpush(
    CONFIG.TRANSCODE_QUEUE_NAME,
    JSON.stringify({
      meetingId: roomId,
      finalPath,
    }),
  );

  try {
    await cleanupEditorProjectState(roomId, projectId, normalizedPublicFinalPath);
  } catch (error) {
    log("warn", "Editor cleanup failed after export", {
      roomId,
      projectId,
      err: error instanceof Error ? error.message : String(error),
    });
  }

  return normalizedPublicFinalPath;
}

async function cleanupEditorProjectState(roomId: string, projectId: string, finalVideoUrl: string) {
  const project = await prisma.editorProject.findFirst({
    where: { id: projectId },
    include: {
      meeting: {
        include: {
          finalRecording: true,
        },
      },
      assets: true,
    },
  });

  if (!project) {
    return;
  }

  const preservedUrl = project.meeting.finalRecording?.videoLink ?? finalVideoUrl;
  const preservedAsset = project.assets.find((asset) => asset.url === preservedUrl);

  await prisma.$transaction(async (tx) => {
    await tx.editorOverlay.deleteMany({ where: { projectId } });
    await tx.editorTrack.deleteMany({ where: { projectId } });

    if (preservedAsset) {
      await tx.editorAsset.deleteMany({
        where: {
          projectId,
          id: { not: preservedAsset.id },
        },
      });
    } else {
      await tx.editorAsset.deleteMany({ where: { projectId } });
      await tx.editorAsset.create({
        data: {
          projectId,
          meetingId: project.meetingId,
          assetType: "VIDEO",
          url: preservedUrl,
        },
      });
    }

    await tx.editorProject.update({
      where: { id: projectId },
      data: {
        status: "DRAFT",
        durationMs: null,
      },
    });
  });

  await Promise.allSettled([
    removeIfExists(path.join(recordingsRoot, roomId, "editor", "projects", projectId)),
    removeIfExists(path.join(recordingsRoot, roomId, "editor-assets")),
  ]);
}

/*
  Warnings:

  - You are about to drop the `EditorAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EditorClip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EditorOverlay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EditorProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EditorTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExportJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinalRecording` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MediaChunk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MeetingRole" AS ENUM ('HOST', 'CO_HOST', 'PARTICIPANT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OverlayType" ADD VALUE 'IMAGE';
ALTER TYPE "OverlayType" ADD VALUE 'LOWER_THIRD';
ALTER TYPE "OverlayType" ADD VALUE 'SHAPE';

-- DropForeignKey
ALTER TABLE "EditorAsset" DROP CONSTRAINT "EditorAsset_projectId_fkey";

-- DropForeignKey
ALTER TABLE "EditorClip" DROP CONSTRAINT "EditorClip_sourceAssetId_fkey";

-- DropForeignKey
ALTER TABLE "EditorClip" DROP CONSTRAINT "EditorClip_trackId_fkey";

-- DropForeignKey
ALTER TABLE "EditorOverlay" DROP CONSTRAINT "EditorOverlay_projectId_fkey";

-- DropForeignKey
ALTER TABLE "EditorProject" DROP CONSTRAINT "EditorProject_finalRecordingId_fkey";

-- DropForeignKey
ALTER TABLE "EditorProject" DROP CONSTRAINT "EditorProject_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "EditorProject" DROP CONSTRAINT "EditorProject_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "EditorTrack" DROP CONSTRAINT "EditorTrack_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ExportJob" DROP CONSTRAINT "ExportJob_projectId_fkey";

-- DropForeignKey
ALTER TABLE "FinalRecording" DROP CONSTRAINT "FinalRecording_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "MediaChunk" DROP CONSTRAINT "MediaChunk_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropTable
DROP TABLE "EditorAsset";

-- DropTable
DROP TABLE "EditorClip";

-- DropTable
DROP TABLE "EditorOverlay";

-- DropTable
DROP TABLE "EditorProject";

-- DropTable
DROP TABLE "EditorTrack";

-- DropTable
DROP TABLE "ExportJob";

-- DropTable
DROP TABLE "FinalRecording";

-- DropTable
DROP TABLE "MediaChunk";

-- DropTable
DROP TABLE "Meeting";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "avatarUrl" TEXT,
    "timezone" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_schedules" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_participants" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MeetingRole" NOT NULL DEFAULT 'PARTICIPANT',

    CONSTRAINT "schedule_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "scheduleId" TEXT,
    "passcode" TEXT,
    "hostId" TEXT NOT NULL,
    "roomName" TEXT,
    "isEnded" BOOLEAN NOT NULL DEFAULT false,
    "endedAt" TIMESTAMP(3),
    "recordingState" "RecordingState" NOT NULL DEFAULT 'IDLE',
    "recordingStartedAt" TIMESTAMP(3),
    "recordingStoppedAt" TIMESTAMP(3),
    "processingStartedAt" TIMESTAMP(3),
    "processingEndedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_participants" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MeetingRole" NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_chunks" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "bucketLink" TEXT NOT NULL,
    "mimeType" TEXT,
    "uploaderUserId" TEXT,
    "sequenceNumber" INTEGER,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ChunkUploadStatus" NOT NULL DEFAULT 'UPLOADED',

    CONSTRAINT "media_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_recordings" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "videoLink" TEXT NOT NULL,
    "audioLink" TEXT,
    "visibleToEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "final_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_projects" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "finalRecordingId" TEXT,
    "sourceMode" "SourceMode" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fps" INTEGER NOT NULL DEFAULT 30,
    "width" INTEGER NOT NULL DEFAULT 1280,
    "height" INTEGER NOT NULL DEFAULT 720,

    CONSTRAINT "editor_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_tracks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "TrackType" NOT NULL,
    "order" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "volume" DOUBLE PRECISION DEFAULT 1.0,

    CONSTRAINT "editor_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_clips" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "sourceAssetId" TEXT NOT NULL,
    "sourceStartMs" INTEGER NOT NULL,
    "timelineStartMs" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,

    CONSTRAINT "editor_clips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_overlays" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "OverlayType" NOT NULL,
    "content" JSONB NOT NULL,
    "timelineStartMs" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "transform" JSONB NOT NULL,
    "style" JSONB NOT NULL,
    "zIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "editor_overlays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editor_assets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "participantId" TEXT,
    "assetType" "AssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "waveformUrl" TEXT,
    "thumbUrl" TEXT,
    "durationMs" INTEGER,

    CONSTRAINT "editor_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'QUEUED',
    "outputUrl" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_googleId_idx" ON "users"("googleId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "meeting_schedules_hostId_idx" ON "meeting_schedules"("hostId");

-- CreateIndex
CREATE INDEX "meeting_schedules_startTime_idx" ON "meeting_schedules"("startTime");

-- CreateIndex
CREATE INDEX "schedule_participants_scheduleId_idx" ON "schedule_participants"("scheduleId");

-- CreateIndex
CREATE INDEX "schedule_participants_userId_idx" ON "schedule_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_participants_scheduleId_userId_key" ON "schedule_participants"("scheduleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_roomId_key" ON "meetings"("roomId");

-- CreateIndex
CREATE INDEX "meetings_hostId_idx" ON "meetings"("hostId");

-- CreateIndex
CREATE INDEX "meetings_scheduleId_idx" ON "meetings"("scheduleId");

-- CreateIndex
CREATE INDEX "meetings_recordingState_idx" ON "meetings"("recordingState");

-- CreateIndex
CREATE INDEX "meeting_participants_meetingId_idx" ON "meeting_participants"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_participants_userId_idx" ON "meeting_participants"("userId");

-- CreateIndex
CREATE INDEX "meeting_participants_meetingId_userId_idx" ON "meeting_participants"("meetingId", "userId");

-- CreateIndex
CREATE INDEX "media_chunks_meetingId_status_idx" ON "media_chunks"("meetingId", "status");

-- CreateIndex
CREATE INDEX "media_chunks_uploaderUserId_idx" ON "media_chunks"("uploaderUserId");

-- CreateIndex
CREATE UNIQUE INDEX "media_chunks_meetingId_uploaderUserId_sequenceNumber_key" ON "media_chunks"("meetingId", "uploaderUserId", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "final_recordings_meetingId_key" ON "final_recordings"("meetingId");

-- CreateIndex
CREATE INDEX "editor_projects_ownerId_idx" ON "editor_projects"("ownerId");

-- CreateIndex
CREATE INDEX "editor_projects_meetingId_idx" ON "editor_projects"("meetingId");

-- CreateIndex
CREATE INDEX "editor_projects_finalRecordingId_idx" ON "editor_projects"("finalRecordingId");

-- CreateIndex
CREATE INDEX "editor_projects_status_idx" ON "editor_projects"("status");

-- CreateIndex
CREATE INDEX "editor_tracks_projectId_idx" ON "editor_tracks"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "editor_tracks_projectId_order_key" ON "editor_tracks"("projectId", "order");

-- CreateIndex
CREATE INDEX "editor_clips_trackId_idx" ON "editor_clips"("trackId");

-- CreateIndex
CREATE INDEX "editor_clips_sourceAssetId_idx" ON "editor_clips"("sourceAssetId");

-- CreateIndex
CREATE INDEX "editor_overlays_projectId_idx" ON "editor_overlays"("projectId");

-- CreateIndex
CREATE INDEX "editor_assets_projectId_idx" ON "editor_assets"("projectId");

-- CreateIndex
CREATE INDEX "editor_assets_meetingId_idx" ON "editor_assets"("meetingId");

-- CreateIndex
CREATE INDEX "editor_assets_participantId_idx" ON "editor_assets"("participantId");

-- CreateIndex
CREATE INDEX "export_jobs_projectId_idx" ON "export_jobs"("projectId");

-- CreateIndex
CREATE INDEX "export_jobs_status_idx" ON "export_jobs"("status");

-- CreateIndex
CREATE INDEX "export_jobs_createdAt_idx" ON "export_jobs"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_schedules" ADD CONSTRAINT "meeting_schedules_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "meeting_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "meeting_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_chunks" ADD CONSTRAINT "media_chunks_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "final_recordings" ADD CONSTRAINT "final_recordings_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_finalRecordingId_fkey" FOREIGN KEY ("finalRecordingId") REFERENCES "final_recordings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_tracks" ADD CONSTRAINT "editor_tracks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "editor_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_clips" ADD CONSTRAINT "editor_clips_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "editor_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_clips" ADD CONSTRAINT "editor_clips_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "editor_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_overlays" ADD CONSTRAINT "editor_overlays_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "editor_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editor_assets" ADD CONSTRAINT "editor_assets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "editor_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "editor_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

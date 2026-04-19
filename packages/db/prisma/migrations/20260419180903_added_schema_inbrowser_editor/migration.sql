/*
  Warnings:

  - You are about to drop the `mediaChunks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meeting` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SourceMode" AS ENUM ('FINAL', 'MULTITRACK');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'READY', 'EXPORTING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TrackType" AS ENUM ('VIDEO', 'AUDIO', 'TEXT');

-- CreateEnum
CREATE TYPE "OverlayType" AS ENUM ('TEXT');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('VIDEO', 'AUDIO');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('QUEUED', 'PROCESSING', 'DONE', 'FAILED');

-- DropForeignKey
ALTER TABLE "FinalRecording" DROP CONSTRAINT "FinalRecording_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "mediaChunks" DROP CONSTRAINT "mediaChunks_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "meeting" DROP CONSTRAINT "meeting_userId_fkey";

-- DropTable
DROP TABLE "mediaChunks";

-- DropTable
DROP TABLE "meeting";

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "passcode" TEXT,
    "userId" TEXT NOT NULL,
    "roomName" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "isEnded" BOOLEAN NOT NULL DEFAULT false,
    "isHost" BOOLEAN NOT NULL,
    "joinedParticipants" TEXT[],
    "invitedParticipants" TEXT[],
    "recordingState" "RecordingState" NOT NULL DEFAULT 'IDLE',
    "recordingStartedAt" TIMESTAMP(3),
    "recordingStoppedAt" TIMESTAMP(3),
    "processingStartedAt" TIMESTAMP(3),
    "processingEndedAt" TIMESTAMP(3),

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaChunk" (
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

    CONSTRAINT "MediaChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorProject" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "finalRecordingId" TEXT,
    "sourceMode" "SourceMode" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditorProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorTrack" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "TrackType" NOT NULL,
    "order" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "volume" DOUBLE PRECISION DEFAULT 1.0,

    CONSTRAINT "EditorTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorClip" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "sourceAssetId" TEXT NOT NULL,
    "sourceStartMs" INTEGER NOT NULL,
    "timelineStartMs" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,

    CONSTRAINT "EditorClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorOverlay" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "OverlayType" NOT NULL,
    "content" JSONB NOT NULL,
    "timelineStartMs" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "transform" JSONB NOT NULL,
    "style" JSONB NOT NULL,

    CONSTRAINT "EditorOverlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorAsset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "participantId" TEXT,
    "assetType" "AssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "waveformUrl" TEXT,
    "thumbUrl" TEXT,
    "durationMs" INTEGER,

    CONSTRAINT "EditorAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'QUEUED',
    "outputUrl" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_roomId_idx" ON "Meeting"("roomId");

-- CreateIndex
CREATE INDEX "Meeting_userId_idx" ON "Meeting"("userId");

-- CreateIndex
CREATE INDEX "MediaChunk_meetingId_uploaderUserId_sequenceNumber_idx" ON "MediaChunk"("meetingId", "uploaderUserId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "EditorProject_meetingId_idx" ON "EditorProject"("meetingId");

-- CreateIndex
CREATE INDEX "EditorProject_ownerId_idx" ON "EditorProject"("ownerId");

-- CreateIndex
CREATE INDEX "EditorProject_finalRecordingId_idx" ON "EditorProject"("finalRecordingId");

-- CreateIndex
CREATE INDEX "EditorTrack_projectId_idx" ON "EditorTrack"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "EditorTrack_projectId_order_key" ON "EditorTrack"("projectId", "order");

-- CreateIndex
CREATE INDEX "EditorClip_trackId_idx" ON "EditorClip"("trackId");

-- CreateIndex
CREATE INDEX "EditorClip_sourceAssetId_idx" ON "EditorClip"("sourceAssetId");

-- CreateIndex
CREATE INDEX "EditorOverlay_projectId_idx" ON "EditorOverlay"("projectId");

-- CreateIndex
CREATE INDEX "EditorAsset_projectId_idx" ON "EditorAsset"("projectId");

-- CreateIndex
CREATE INDEX "EditorAsset_participantId_idx" ON "EditorAsset"("participantId");

-- CreateIndex
CREATE INDEX "ExportJob_projectId_idx" ON "ExportJob"("projectId");

-- CreateIndex
CREATE INDEX "ExportJob_status_idx" ON "ExportJob"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaChunk" ADD CONSTRAINT "MediaChunk_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalRecording" ADD CONSTRAINT "FinalRecording_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorProject" ADD CONSTRAINT "EditorProject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorProject" ADD CONSTRAINT "EditorProject_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorProject" ADD CONSTRAINT "EditorProject_finalRecordingId_fkey" FOREIGN KEY ("finalRecordingId") REFERENCES "FinalRecording"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorTrack" ADD CONSTRAINT "EditorTrack_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "EditorProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorClip" ADD CONSTRAINT "EditorClip_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "EditorTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorClip" ADD CONSTRAINT "EditorClip_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "EditorAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorOverlay" ADD CONSTRAINT "EditorOverlay_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "EditorProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorAsset" ADD CONSTRAINT "EditorAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "EditorProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "EditorProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

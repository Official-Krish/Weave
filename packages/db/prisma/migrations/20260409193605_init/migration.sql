-- CreateEnum
CREATE TYPE "quality" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "format" AS ENUM ('webm', 'MP4', 'WAV', 'OGG');

-- CreateEnum
CREATE TYPE "RecordingState" AS ENUM ('IDLE', 'RECORDING', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ChunkUploadStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'MERGED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "passcode" TEXT,
    "userId" TEXT NOT NULL,
    "roomName" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "isEnded" BOOLEAN NOT NULL DEFAULT false,
    "participants" TEXT[],
    "isHost" BOOLEAN NOT NULL,
    "recordingState" "RecordingState" NOT NULL DEFAULT 'IDLE',
    "recordingStartedAt" TIMESTAMP(3),
    "recordingStoppedAt" TIMESTAMP(3),
    "processingStartedAt" TIMESTAMP(3),
    "processingEndedAt" TIMESTAMP(3),

    CONSTRAINT "meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediaChunks" (
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

    CONSTRAINT "mediaChunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalRecording" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "VideoLink" TEXT NOT NULL,
    "AudioLink" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "format" "format" NOT NULL,
    "quality" "quality" NOT NULL,

    CONSTRAINT "FinalRecording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "mediaChunks_meetingId_uploaderUserId_sequenceNumber_idx" ON "mediaChunks"("meetingId", "uploaderUserId", "sequenceNumber");

-- AddForeignKey
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediaChunks" ADD CONSTRAINT "mediaChunks_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalRecording" ADD CONSTRAINT "FinalRecording_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropIndex
DROP INDEX "mediaChunks_meetingId_key";

-- AlterTable
ALTER TABLE "meeting" ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "endTime" DROP NOT NULL;

/*
  Warnings:

  - You are about to drop the column `AudioLink` on the `FinalRecording` table. All the data in the column will be lost.
  - You are about to drop the column `VideoLink` on the `FinalRecording` table. All the data in the column will be lost.
  - You are about to drop the column `meetingId` on the `meeting` table. All the data in the column will be lost.
  - Added the required column `videoLink` to the `FinalRecording` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `meeting` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "meeting_meetingId_key";

-- AlterTable
ALTER TABLE "FinalRecording" DROP COLUMN "AudioLink",
DROP COLUMN "VideoLink",
ADD COLUMN     "audioLink" TEXT,
ADD COLUMN     "videoLink" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "meeting" DROP COLUMN "meetingId",
ADD COLUMN     "roomId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "meeting_roomId_idx" ON "meeting"("roomId");

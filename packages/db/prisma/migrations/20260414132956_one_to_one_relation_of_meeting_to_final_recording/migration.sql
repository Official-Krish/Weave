/*
  Warnings:

  - You are about to drop the column `format` on the `FinalRecording` table. All the data in the column will be lost.
  - You are about to drop the column `quality` on the `FinalRecording` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[meetingId]` on the table `FinalRecording` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[meetingId]` on the table `meeting` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FinalRecording" DROP COLUMN "format",
DROP COLUMN "quality";

-- DropEnum
DROP TYPE "format";

-- DropEnum
DROP TYPE "quality";

-- CreateIndex
CREATE UNIQUE INDEX "FinalRecording_meetingId_key" ON "FinalRecording"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_meetingId_key" ON "meeting"("meetingId");

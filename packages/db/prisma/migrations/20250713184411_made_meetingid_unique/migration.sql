/*
  Warnings:

  - A unique constraint covering the columns `[meetingId]` on the table `meeting` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "mediaChunks" DROP CONSTRAINT "mediaChunks_meetingId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "meeting_meetingId_key" ON "meeting"("meetingId");

-- AddForeignKey
ALTER TABLE "mediaChunks" ADD CONSTRAINT "mediaChunks_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("meetingId") ON DELETE RESTRICT ON UPDATE CASCADE;

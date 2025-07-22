-- DropForeignKey
ALTER TABLE "mediaChunks" DROP CONSTRAINT "mediaChunks_meetingId_fkey";

-- DropIndex
DROP INDEX "meeting_meetingId_key";

-- AddForeignKey
ALTER TABLE "mediaChunks" ADD CONSTRAINT "mediaChunks_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

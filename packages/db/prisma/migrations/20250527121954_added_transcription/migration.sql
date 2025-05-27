/*
  Warnings:

  - You are about to drop the column `bucketLink` on the `FinalRecording` table. All the data in the column will be lost.
  - Added the required column `AudioLink` to the `FinalRecording` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VideoLink` to the `FinalRecording` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinalRecording" DROP COLUMN "bucketLink",
ADD COLUMN     "AudioLink" TEXT NOT NULL,
ADD COLUMN     "VideoLink" TEXT NOT NULL,
ADD COLUMN     "transcription" TEXT;

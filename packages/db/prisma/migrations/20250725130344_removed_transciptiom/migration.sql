/*
  Warnings:

  - You are about to drop the column `transcription` on the `FinalRecording` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FinalRecording" DROP COLUMN "transcription",
ALTER COLUMN "AudioLink" DROP NOT NULL;

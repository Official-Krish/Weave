-- AlterTable
ALTER TABLE "FinalRecording" ADD COLUMN     "visibleToEmails" TEXT[] DEFAULT ARRAY[]::TEXT[];

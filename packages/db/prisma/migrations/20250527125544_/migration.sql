/*
  Warnings:

  - The values [MP3] on the enum `format` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "format_new" AS ENUM ('webm', 'MP4', 'WAV', 'OGG');
ALTER TABLE "FinalRecording" ALTER COLUMN "format" TYPE "format_new" USING ("format"::text::"format_new");
ALTER TYPE "format" RENAME TO "format_old";
ALTER TYPE "format_new" RENAME TO "format";
DROP TYPE "format_old";
COMMIT;

/*
  Warnings:

  - You are about to drop the column `participants` on the `meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "meeting" DROP COLUMN "participants",
ADD COLUMN     "invitedParticipants" TEXT[],
ADD COLUMN     "joinedParticipants" TEXT[];

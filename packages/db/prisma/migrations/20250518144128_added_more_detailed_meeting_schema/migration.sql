/*
  Warnings:

  - You are about to drop the column `title` on the `meeting` table. All the data in the column will be lost.
  - Added the required column `isHost` to the `meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "meeting" DROP COLUMN "title",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isHost" BOOLEAN NOT NULL,
ADD COLUMN     "participants" TEXT[],
ADD COLUMN     "passcode" TEXT,
ADD COLUMN     "roomName" TEXT;

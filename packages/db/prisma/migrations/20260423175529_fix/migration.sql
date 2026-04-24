/*
  Warnings:

  - You are about to drop the column `hostId` on the `meetings` table. All the data in the column will be lost.
  - Added the required column `userId` to the `meetings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "meetings" DROP CONSTRAINT "meetings_hostId_fkey";

-- DropIndex
DROP INDEX "meetings_hostId_idx";

-- AlterTable
ALTER TABLE "meetings" DROP COLUMN "hostId",
ADD COLUMN     "isHost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "meetings_userId_idx" ON "meetings"("userId");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

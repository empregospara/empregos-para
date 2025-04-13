/*
  Warnings:

  - You are about to drop the column `filePath` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Media` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Media" DROP COLUMN "filePath",
DROP COLUMN "title",
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "url" TEXT;

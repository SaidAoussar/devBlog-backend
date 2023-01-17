/*
  Warnings:

  - You are about to drop the column `publishedAt` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Post` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "publishedAt",
DROP COLUMN "title",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "published" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "publishedAt",
ALTER COLUMN "published" SET DEFAULT true;

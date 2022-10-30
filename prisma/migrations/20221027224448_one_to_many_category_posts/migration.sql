/*
  Warnings:

  - You are about to drop the `CategoriesOnPosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoriesOnPosts" DROP CONSTRAINT "CategoriesOnPosts_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnPosts" DROP CONSTRAINT "CategoriesOnPosts_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "categoryId" INTEGER;

-- DropTable
DROP TABLE "CategoriesOnPosts";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

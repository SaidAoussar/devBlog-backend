-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('DARK', 'LIGHT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mode" "Mode" NOT NULL DEFAULT 'DARK';

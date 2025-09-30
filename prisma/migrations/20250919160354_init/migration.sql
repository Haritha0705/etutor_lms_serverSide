/*
  Warnings:

  - You are about to drop the column `count` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `SubCategory` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `Tool` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "count",
ADD COLUMN     "coursesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."SubCategory" DROP COLUMN "count",
ADD COLUMN     "coursesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Tool" DROP COLUMN "count",
ADD COLUMN     "coursesCount" INTEGER NOT NULL DEFAULT 0;

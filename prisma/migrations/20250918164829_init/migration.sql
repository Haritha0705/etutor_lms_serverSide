/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_subCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubCategory" DROP CONSTRAINT "SubCategory_categoryId_fkey";

-- DropIndex
DROP INDEX "public"."Course_categoryId_idx";

-- DropIndex
DROP INDEX "public"."Course_subCategoryId_idx";

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "category" VARCHAR(100) NOT NULL,
ADD COLUMN     "categoryIcon" TEXT,
ADD COLUMN     "subCategory" TEXT[];

-- DropTable
DROP TABLE "public"."Category";

-- DropTable
DROP TABLE "public"."SubCategory";

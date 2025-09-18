/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `subCategoryId` on the `Course` table. All the data in the column will be lost.
  - You are about to alter the column `subCategory` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "categoryId",
DROP COLUMN "subCategoryId",
ALTER COLUMN "subCategory" SET DATA TYPE VARCHAR(100);

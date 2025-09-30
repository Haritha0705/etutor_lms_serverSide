/*
  Warnings:

  - The `name` column on the `Tool` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Tool" DROP COLUMN "name",
ADD COLUMN     "name" TEXT[];

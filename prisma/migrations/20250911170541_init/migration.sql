/*
  Warnings:

  - Added the required column `correctAnswer` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Quiz" ADD COLUMN     "correctAnswer" INTEGER NOT NULL;

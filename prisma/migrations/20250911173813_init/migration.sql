/*
  Warnings:

  - Made the column `score` on table `StudentQuizSubmission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."StudentQuizSubmission" ALTER COLUMN "score" SET NOT NULL;

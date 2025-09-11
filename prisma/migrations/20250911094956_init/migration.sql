/*
  Warnings:

  - You are about to drop the column `courseId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `instructorId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the `StudentQuizSubmission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `assignmentId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentQuizSubmission" DROP CONSTRAINT "StudentQuizSubmission_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StudentQuizSubmission" DROP CONSTRAINT "StudentQuizSubmission_studentId_fkey";

-- DropIndex
DROP INDEX "public"."Quiz_courseId_idx";

-- DropIndex
DROP INDEX "public"."Quiz_instructorId_idx";

-- AlterTable
ALTER TABLE "public"."Quiz" DROP COLUMN "courseId",
DROP COLUMN "instructorId",
ADD COLUMN     "assignmentId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."StudentQuizSubmission";

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "instructorId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Assignment_courseId_idx" ON "public"."Assignment"("courseId");

-- CreateIndex
CREATE INDEX "Assignment_instructorId_idx" ON "public"."Assignment"("instructorId");

-- CreateIndex
CREATE INDEX "Quiz_assignmentId_idx" ON "public"."Quiz"("assignmentId");

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."InstructorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to alter the column `title` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `category` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `full_name` on the `InstructorProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `expertise` on the `InstructorProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `profilePic` on the `InstructorProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `title` on the `Lesson` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `Otp` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `code` on the `Otp` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(6)`.
  - You are about to alter the column `token` on the `RefreshToken` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `profilePic` on the `StudentProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `full_name` on the `StudentProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `phone` on the `StudentProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `address` on the `StudentProfile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `username` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `firstName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `avatarUrl` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `resetPasswordToken` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "public"."Course" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "category" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."InstructorProfile" ALTER COLUMN "full_name" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "expertise" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "profilePic" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "public"."Lesson" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."Otp" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "code" SET DATA TYPE VARCHAR(6);

-- AlterTable
ALTER TABLE "public"."RefreshToken" ALTER COLUMN "token" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "public"."StudentProfile" ALTER COLUMN "profilePic" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "full_name" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "address" SET DATA TYPE VARCHAR(300);

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "avatarUrl" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "resetPasswordToken" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "public"."course_enrollments" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_enrollments_studentId_idx" ON "public"."course_enrollments"("studentId");

-- CreateIndex
CREATE INDEX "course_enrollments_courseId_idx" ON "public"."course_enrollments"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_studentId_courseId_key" ON "public"."course_enrollments"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "Course_instructorId_idx" ON "public"."Course"("instructorId");

-- CreateIndex
CREATE INDEX "Lesson_courseId_idx" ON "public"."Lesson"("courseId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

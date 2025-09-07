-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "resetPasswordTokenExpiry" TIMESTAMP(3);

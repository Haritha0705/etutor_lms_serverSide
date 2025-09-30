-- CreateTable
CREATE TABLE "public"."StudentQuizSubmission" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "answer" INTEGER NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentQuizSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentQuizSubmission_studentId_idx" ON "public"."StudentQuizSubmission"("studentId");

-- CreateIndex
CREATE INDEX "StudentQuizSubmission_quizId_idx" ON "public"."StudentQuizSubmission"("quizId");

-- AddForeignKey
ALTER TABLE "public"."StudentQuizSubmission" ADD CONSTRAINT "StudentQuizSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentQuizSubmission" ADD CONSTRAINT "StudentQuizSubmission_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

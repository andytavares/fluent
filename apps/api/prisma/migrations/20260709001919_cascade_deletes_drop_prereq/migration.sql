/*
  Warnings:

  - You are about to drop the column `prereqConceptId` on the `concepts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "capstone_sessions" DROP CONSTRAINT "capstone_sessions_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "capstone_step_completions" DROP CONSTRAINT "capstone_step_completions_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "concept_states" DROP CONSTRAINT "concept_states_enrollmentId_fkey";

-- DropForeignKey
ALTER TABLE "concepts" DROP CONSTRAINT "concepts_prereqConceptId_fkey";

-- DropForeignKey
ALTER TABLE "mastery_events" DROP CONSTRAINT "mastery_events_enrollmentId_fkey";

-- AlterTable
ALTER TABLE "concepts" DROP COLUMN "prereqConceptId";

-- CreateIndex
CREATE INDEX "submissions_enrollmentId_idx" ON "submissions"("enrollmentId");

-- AddForeignKey
ALTER TABLE "concept_states" ADD CONSTRAINT "concept_states_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_events" ADD CONSTRAINT "mastery_events_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capstone_sessions" ADD CONSTRAINT "capstone_sessions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capstone_step_completions" ADD CONSTRAINT "capstone_step_completions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "capstone_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

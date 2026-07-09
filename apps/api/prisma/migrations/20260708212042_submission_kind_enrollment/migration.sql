-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('lesson', 'test_out', 'placement');

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "enrollmentId" UUID,
ADD COLUMN     "kind" "SubmissionKind" NOT NULL DEFAULT 'lesson';

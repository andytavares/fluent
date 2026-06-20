-- CreateEnum
CREATE TYPE "TrackStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "ConceptStatus" AS ENUM ('wip', 'published');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('lesson', 'testout', 'placement');

-- CreateEnum
CREATE TYPE "LearnerState" AS ENUM ('locked', 'available', 'in_progress', 'mastered', 'completed');

-- CreateEnum
CREATE TYPE "AchievedVia" AS ENUM ('placement', 'test_out', 'lesson');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" "TrackStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trackId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "lessonAvgTimeMs" INTEGER,
    "hasTestout" BOOLEAN NOT NULL DEFAULT false,
    "status" "ConceptStatus" NOT NULL DEFAULT 'wip',
    "prereqConceptId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conceptId" UUID NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "contentPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "trackId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concept_states" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enrollmentId" UUID NOT NULL,
    "conceptId" UUID NOT NULL,
    "state" "LearnerState" NOT NULL DEFAULT 'locked',
    "achievedVia" "AchievedVia",
    "openedAt" TIMESTAMP(3),
    "masteredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "concept_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "conceptId" UUID NOT NULL,
    "exerciseId" UUID,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'go',
    "stdout" TEXT,
    "stderr" TEXT,
    "exitCode" INTEGER,
    "runtimeMs" INTEGER,
    "timedOut" BOOLEAN NOT NULL DEFAULT false,
    "isSuite" BOOLEAN NOT NULL DEFAULT false,
    "passed" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mastery_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "enrollmentId" UUID NOT NULL,
    "conceptId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "achievedVia" "AchievedVia" NOT NULL,
    "lessonAvgTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mastery_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capstone_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "k8sJobName" TEXT,
    "dbConnectionEncrypted" TEXT,
    "dbProvisionedAt" TIMESTAMP(3),
    "dbExpiresAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "capstone_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capstone_step_completions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sessionId" UUID NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationResult" JSONB NOT NULL,
    CONSTRAINT "capstone_step_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "trackId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "tracks_slug_key" ON "tracks"("slug");
CREATE UNIQUE INDEX "concepts_trackId_slug_key" ON "concepts"("trackId", "slug");
CREATE UNIQUE INDEX "concepts_trackId_position_key" ON "concepts"("trackId", "position");
CREATE UNIQUE INDEX "enrollments_userId_trackId_key" ON "enrollments"("userId", "trackId");
CREATE UNIQUE INDEX "concept_states_enrollmentId_conceptId_key" ON "concept_states"("enrollmentId", "conceptId");
CREATE UNIQUE INDEX "capstone_step_completions_sessionId_stepNumber_key" ON "capstone_step_completions"("sessionId", "stepNumber");
CREATE UNIQUE INDEX "credentials_token_key" ON "credentials"("token");

-- CreateIndex
CREATE INDEX "concept_states_enrollmentId_idx" ON "concept_states"("enrollmentId");
CREATE INDEX "concept_states_conceptId_idx" ON "concept_states"("conceptId");
CREATE INDEX "submissions_userId_conceptId_createdAt_idx" ON "submissions"("userId", "conceptId", "createdAt" DESC);
CREATE INDEX "mastery_events_enrollmentId_idx" ON "mastery_events"("enrollmentId");

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_prereqConceptId_fkey" FOREIGN KEY ("prereqConceptId") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "concept_states" ADD CONSTRAINT "concept_states_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "concept_states" ADD CONSTRAINT "concept_states_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "mastery_events" ADD CONSTRAINT "mastery_events_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mastery_events" ADD CONSTRAINT "mastery_events_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "mastery_events" ADD CONSTRAINT "mastery_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "capstone_sessions" ADD CONSTRAINT "capstone_sessions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "capstone_step_completions" ADD CONSTRAINT "capstone_step_completions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "capstone_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

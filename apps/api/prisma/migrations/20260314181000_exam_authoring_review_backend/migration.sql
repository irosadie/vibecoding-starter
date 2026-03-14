DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExamLevel') THEN
    CREATE TYPE "ExamLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExamDraftStatus') THEN
    CREATE TYPE "ExamDraftStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'NEEDS_REVISION', 'PUBLISHED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExamVersionStatus') THEN
    CREATE TYPE "ExamVersionStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'REJECTED', 'PUBLISHED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuestionCorrectOption') THEN
    CREATE TYPE "QuestionCorrectOption" AS ENUM ('A', 'B', 'C', 'D');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExamReviewAction') THEN
    CREATE TYPE "ExamReviewAction" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "exams" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "creator_id" UUID NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "level" "ExamLevel" NOT NULL,
  "short_description" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "current_status" "ExamDraftStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exams_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "exams_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exam_versions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_id" UUID NOT NULL,
  "version_number" INTEGER NOT NULL,
  "status" "ExamVersionStatus" NOT NULL DEFAULT 'DRAFT',
  "metadata_snapshot" JSONB NOT NULL,
  "submitted_at" TIMESTAMP(6),
  "reviewed_by" UUID,
  "reviewed_at" TIMESTAMP(6),
  "review_note" TEXT,
  "published_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exam_versions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "exam_versions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "exam_versions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exam_questions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_version_id" UUID NOT NULL,
  "order_number" INTEGER NOT NULL,
  "prompt" TEXT NOT NULL,
  "option_a" TEXT NOT NULL,
  "option_b" TEXT NOT NULL,
  "option_c" TEXT NOT NULL,
  "option_d" TEXT NOT NULL,
  "correct_option" "QuestionCorrectOption" NOT NULL,
  "explanation_text" TEXT,
  "explanation_video_url" TEXT,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "exam_questions_exam_version_id_fkey" FOREIGN KEY ("exam_version_id") REFERENCES "exam_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "exam_review_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "exam_version_id" UUID NOT NULL,
  "actor_id" UUID NOT NULL,
  "action" "ExamReviewAction" NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exam_review_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "exam_review_logs_exam_version_id_fkey" FOREIGN KEY ("exam_version_id") REFERENCES "exam_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "exam_review_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "exams_slug_key" ON "exams"("slug");
CREATE INDEX IF NOT EXISTS "exams_creator_id_idx" ON "exams"("creator_id");
CREATE INDEX IF NOT EXISTS "exams_current_status_idx" ON "exams"("current_status");
CREATE INDEX IF NOT EXISTS "exams_updated_at_idx" ON "exams"("updated_at");

CREATE UNIQUE INDEX IF NOT EXISTS "exam_versions_exam_id_version_number_key" ON "exam_versions"("exam_id", "version_number");
CREATE INDEX IF NOT EXISTS "exam_versions_status_idx" ON "exam_versions"("status");
CREATE INDEX IF NOT EXISTS "exam_versions_submitted_at_idx" ON "exam_versions"("submitted_at");

CREATE UNIQUE INDEX IF NOT EXISTS "exam_questions_exam_version_id_order_number_key" ON "exam_questions"("exam_version_id", "order_number");
CREATE INDEX IF NOT EXISTS "exam_questions_exam_version_id_idx" ON "exam_questions"("exam_version_id");

CREATE INDEX IF NOT EXISTS "exam_review_logs_exam_version_id_idx" ON "exam_review_logs"("exam_version_id");
CREATE INDEX IF NOT EXISTS "exam_review_logs_actor_id_idx" ON "exam_review_logs"("actor_id");

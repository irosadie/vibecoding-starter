DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreatorApplicationStatus') THEN
    CREATE TYPE "CreatorApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "creator_applications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "ktp_file_url" TEXT NOT NULL,
  "payout_account_name" VARCHAR(255) NOT NULL,
  "payout_bank_name" VARCHAR(100) NOT NULL,
  "payout_account_number" VARCHAR(100) NOT NULL,
  "status" "CreatorApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "submitted_at" TIMESTAMP(6) NOT NULL,
  "reviewed_by" UUID,
  "reviewed_at" TIMESTAMP(6),
  "review_note" TEXT,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creator_applications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "creator_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "creator_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "creator_profiles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "payout_account_name" VARCHAR(255) NOT NULL,
  "payout_bank_name" VARCHAR(100) NOT NULL,
  "payout_account_number" VARCHAR(100) NOT NULL,
  "approved_at" TIMESTAMP(6) NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "creator_profiles_user_id_key" ON "creator_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "creator_applications_user_id_idx" ON "creator_applications"("user_id");
CREATE INDEX IF NOT EXISTS "creator_applications_status_idx" ON "creator_applications"("status");
CREATE INDEX IF NOT EXISTS "creator_applications_submitted_at_idx" ON "creator_applications"("submitted_at");

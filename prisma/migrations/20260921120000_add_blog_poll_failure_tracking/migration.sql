-- AlterEnum
ALTER TYPE "subscription_status" ADD VALUE 'inactive';

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN "poll_failure_count" INTEGER NOT NULL DEFAULT 0;

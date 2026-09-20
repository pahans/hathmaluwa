-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('pending', 'active', 'expiring', 'failed');

-- AlterTable
ALTER TABLE "blogs"
  ADD COLUMN "feed_url" TEXT,
  ADD COLUMN "hub_url" TEXT,
  ADD COLUMN "subscription_secret" TEXT,
  ADD COLUMN "subscription_status" "subscription_status" NOT NULL DEFAULT 'pending',
  ADD COLUMN "lease_expires_at" TIMESTAMPTZ(3),
  ADD COLUMN "last_verified_at" TIMESTAMPTZ(3);

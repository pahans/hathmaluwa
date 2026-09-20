-- AlterEnum
ALTER TYPE "subscription_status" ADD VALUE 'unsupported';

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN "last_polled_at" TIMESTAMPTZ(3);

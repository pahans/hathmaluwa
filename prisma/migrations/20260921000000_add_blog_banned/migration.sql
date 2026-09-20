-- AlterTable
ALTER TABLE "blogs" ADD COLUMN "banned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "blogs" ADD COLUMN "banned_at" TIMESTAMPTZ(3);
ALTER TABLE "blogs" ADD COLUMN "ban_reason" TEXT;

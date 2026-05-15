-- AlterTable: add token column, backfill, add constraints
ALTER TABLE "Order" ADD COLUMN "token" TEXT;

-- Backfill existing rows with UUIDs
UPDATE "Order" SET "token" = gen_random_uuid()::text WHERE "token" IS NULL;

-- Make non-nullable and add unique constraint
ALTER TABLE "Order" ALTER COLUMN "token" SET NOT NULL;
ALTER TABLE "Order" ADD CONSTRAINT "Order_token_key" UNIQUE ("token");

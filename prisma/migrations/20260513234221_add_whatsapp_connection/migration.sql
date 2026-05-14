/*
  Warnings:

  - You are about to drop the `DatasetVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MLModelVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RawOrderFeatures` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RawOrderFeatures" DROP CONSTRAINT "RawOrderFeatures_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryProviderId" TEXT;

-- DropTable
DROP TABLE "DatasetVersion";

-- DropTable
DROP TABLE "MLModelVersion";

-- DropTable
DROP TABLE "RawOrderFeatures";

-- CreateTable
CREATE TABLE "DeliveryProvider" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rtsCostPerFailure" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "avgDeliveryDays" INTEGER NOT NULL DEFAULT 3,
    "contactSuccessRate" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationOutcome" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "estimatedRevenueSaved" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedLossPrevented" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskLevelBefore" TEXT,
    "orderAmount" DOUBLE PRECISION NOT NULL,
    "trustScoreBefore" INTEGER,
    "attemptedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionOutcomeAttribution" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "sequenceType" TEXT,
    "sequenceVersion" INTEGER,
    "riskScoreSnapshot" INTEGER,
    "orderValueSnapshot" DOUBLE PRECISION,
    "buyerOrderCountSnapshot" INTEGER,
    "isFirstOrderSnapshot" BOOLEAN,
    "citySnapshot" TEXT,
    "paymentMethodSnapshot" TEXT,
    "confirmationStateSnapshot" TEXT,
    "finalDeliveryOutcome" TEXT,
    "daysToOutcome" INTEGER,
    "estimatedRevenueSaved" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ActionOutcomeAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerJourneyEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "metadata" TEXT,
    "createdByUserId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerJourneyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "connectedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryProvider_organizationId_name_key" ON "DeliveryProvider"("organizationId", "name");

-- CreateIndex
CREATE INDEX "OperationOutcome_organizationId_createdAt_idx" ON "OperationOutcome"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "OperationOutcome_orderId_idx" ON "OperationOutcome"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ActionOutcomeAttribution_actionId_key" ON "ActionOutcomeAttribution"("actionId");

-- CreateIndex
CREATE INDEX "ActionOutcomeAttribution_organizationId_sequenceType_idx" ON "ActionOutcomeAttribution"("organizationId", "sequenceType");

-- CreateIndex
CREATE INDEX "ActionOutcomeAttribution_organizationId_actionTaken_idx" ON "ActionOutcomeAttribution"("organizationId", "actionTaken");

-- CreateIndex
CREATE INDEX "ActionOutcomeAttribution_organizationId_finalDeliveryOutcom_idx" ON "ActionOutcomeAttribution"("organizationId", "finalDeliveryOutcome");

-- CreateIndex
CREATE INDEX "ActionOutcomeAttribution_organizationId_isFirstOrderSnapsho_idx" ON "ActionOutcomeAttribution"("organizationId", "isFirstOrderSnapshot");

-- CreateIndex
CREATE INDEX "ActionOutcomeAttribution_organizationId_citySnapshot_idx" ON "ActionOutcomeAttribution"("organizationId", "citySnapshot");

-- CreateIndex
CREATE INDEX "ActionOutcomeAttribution_organizationId_riskScoreSnapshot_idx" ON "ActionOutcomeAttribution"("organizationId", "riskScoreSnapshot");

-- CreateIndex
CREATE INDEX "ActionOutcomeAttribution_orderId_idx" ON "ActionOutcomeAttribution"("orderId");

-- CreateIndex
CREATE INDEX "BuyerJourneyEvent_organizationId_orderId_idx" ON "BuyerJourneyEvent"("organizationId", "orderId");

-- CreateIndex
CREATE INDEX "BuyerJourneyEvent_eventType_occurredAt_idx" ON "BuyerJourneyEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "BuyerJourneyEvent_occurredAt_idx" ON "BuyerJourneyEvent"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppConnection_organizationId_key" ON "WhatsAppConnection"("organizationId");

-- AddForeignKey
ALTER TABLE "DeliveryProvider" ADD CONSTRAINT "DeliveryProvider_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationOutcome" ADD CONSTRAINT "OperationOutcome_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationOutcome" ADD CONSTRAINT "OperationOutcome_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryProviderId_fkey" FOREIGN KEY ("deliveryProviderId") REFERENCES "DeliveryProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppConnection" ADD CONSTRAINT "WhatsAppConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

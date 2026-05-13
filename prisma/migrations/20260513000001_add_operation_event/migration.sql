-- CreateTable
CREATE TABLE "OperationEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" TEXT,
    "actorType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationEvent_organizationId_orderId_idx" ON "OperationEvent"("organizationId", "orderId");

-- CreateIndex
CREATE INDEX "OperationEvent_organizationId_createdAt_idx" ON "OperationEvent"("organizationId", "createdAt");

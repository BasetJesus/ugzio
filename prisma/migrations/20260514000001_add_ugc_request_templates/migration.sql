-- CreateTable
CREATE TABLE "UgcRequestTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "messageBody" TEXT NOT NULL,
    "incentive" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UgcRequestTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UgcRequestTemplate" ADD CONSTRAINT "UgcRequestTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

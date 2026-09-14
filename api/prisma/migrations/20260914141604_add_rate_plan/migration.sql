-- CreateTable
CREATE TABLE "RatePlan" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT NOT NULL,
    "baseNightlyAed" INTEGER NOT NULL,
    "weekendMultiplier" DOUBLE PRECISION,
    "seasonalOverrides" JSONB,
    "losDiscounts" JSONB,
    "lastMinuteDiscount" JSONB,
    "occupancyPricing" JSONB,
    "channelMarkups" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RatePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RatePlan_propertyId_key" ON "RatePlan"("propertyId");

-- AddForeignKey
ALTER TABLE "RatePlan" ADD CONSTRAINT "RatePlan_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

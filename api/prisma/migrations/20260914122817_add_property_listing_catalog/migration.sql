/*
  Warnings:

  - The values [CUSTOMER,DRIVER,SUPPORT,SYSTEM,AGENT] on the enum `AccountRoleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CurrentDriverLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DriverLicense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DriverLicensePhoto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DriverReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JunkRemovalItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JunkRemovalItemInOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JunkRemovalOrderDetatils` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationRecipient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderCheckout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderEvidence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderStatusHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderStop` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Place` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StripeCheckout` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StripeIdenety` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StripePaymentMethod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vehicle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VehiclePhotos` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PoiType" AS ENUM ('LANDMARK', 'BEACH', 'MALL', 'DINING');

-- CreateEnum
CREATE TYPE "AmenityCategory" AS ENUM ('ESSENTIALS', 'LIVING', 'KITCHEN', 'OUTDOOR', 'SAFETY', 'PREMIUM');

-- CreateEnum
CREATE TYPE "AccessibilityCategory" AS ENUM ('MOBILITY', 'SENSORY', 'COMMUNICATION', 'COGNITIVE');

-- AlterEnum
BEGIN;
CREATE TYPE "AccountRoleType_new" AS ENUM ('GUEST', 'HOST', 'ADMIN');
ALTER TABLE "AccountRole" ALTER COLUMN "type" TYPE "AccountRoleType_new" USING ("type"::text::"AccountRoleType_new");
ALTER TYPE "AccountRoleType" RENAME TO "AccountRoleType_old";
ALTER TYPE "AccountRoleType_new" RENAME TO "AccountRoleType";
DROP TYPE "public"."AccountRoleType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "CurrentDriverLocation" DROP CONSTRAINT "CurrentDriverLocation_driverId_fkey";

-- DropForeignKey
ALTER TABLE "CurrentDriverLocation" DROP CONSTRAINT "CurrentDriverLocation_locationId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_defaultAddressId_fkey";

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_driverLicenseId_fkey";

-- DropForeignKey
ALTER TABLE "DriverLicensePhoto" DROP CONSTRAINT "DriverLicensePhoto_driverLicenseId_fkey";

-- DropForeignKey
ALTER TABLE "DriverLicensePhoto" DROP CONSTRAINT "DriverLicensePhoto_fileId_fkey";

-- DropForeignKey
ALTER TABLE "DriverReview" DROP CONSTRAINT "DriverReview_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "DriverReview" DROP CONSTRAINT "DriverReview_driverId_fkey";

-- DropForeignKey
ALTER TABLE "JunkRemovalItem" DROP CONSTRAINT "JunkRemovalItem_fileId_fkey";

-- DropForeignKey
ALTER TABLE "JunkRemovalItemInOrder" DROP CONSTRAINT "JunkRemovalItemInOrder_orderId_fkey";

-- DropForeignKey
ALTER TABLE "JunkRemovalItemInOrder" DROP CONSTRAINT "JunkRemovalItemInOrder_priceId_fkey";

-- DropForeignKey
ALTER TABLE "JunkRemovalOrderDetatils" DROP CONSTRAINT "JunkRemovalOrderDetatils_orderId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationRecipient" DROP CONSTRAINT "NotificationRecipient_accountId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationRecipient" DROP CONSTRAINT "NotificationRecipient_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_driverId_fkey";

-- DropForeignKey
ALTER TABLE "OrderCheckout" DROP CONSTRAINT "OrderCheckout_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderCheckout" DROP CONSTRAINT "OrderCheckout_regularPriceId_fkey";

-- DropForeignKey
ALTER TABLE "OrderCheckout" DROP CONSTRAINT "OrderCheckout_totalPriceId_fkey";

-- DropForeignKey
ALTER TABLE "OrderEvidence" DROP CONSTRAINT "OrderEvidence_fileId_fkey";

-- DropForeignKey
ALTER TABLE "OrderEvidence" DROP CONSTRAINT "OrderEvidence_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderNote" DROP CONSTRAINT "OrderNote_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderStatusHistory" DROP CONSTRAINT "OrderStatusHistory_changedById_fkey";

-- DropForeignKey
ALTER TABLE "OrderStatusHistory" DROP CONSTRAINT "OrderStatusHistory_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderStop" DROP CONSTRAINT "OrderStop_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderStop" DROP CONSTRAINT "OrderStop_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_locationId_fkey";

-- DropForeignKey
ALTER TABLE "StripeCheckout" DROP CONSTRAINT "StripeCheckout_accountId_fkey";

-- DropForeignKey
ALTER TABLE "StripeIdenety" DROP CONSTRAINT "StripeIdenety_accountId_fkey";

-- DropForeignKey
ALTER TABLE "StripePaymentMethod" DROP CONSTRAINT "StripePaymentMethod_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Tip" DROP CONSTRAINT "Tip_priceId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_driverId_fkey";

-- DropForeignKey
ALTER TABLE "VehiclePhotos" DROP CONSTRAINT "VehiclePhotos_fileId_fkey";

-- DropForeignKey
ALTER TABLE "VehiclePhotos" DROP CONSTRAINT "VehiclePhotos_vehicleId_fkey";

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "CurrentDriverLocation";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Driver";

-- DropTable
DROP TABLE "DriverLicense";

-- DropTable
DROP TABLE "DriverLicensePhoto";

-- DropTable
DROP TABLE "DriverReview";

-- DropTable
DROP TABLE "JunkRemovalItem";

-- DropTable
DROP TABLE "JunkRemovalItemInOrder";

-- DropTable
DROP TABLE "JunkRemovalOrderDetatils";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "NotificationRecipient";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderCheckout";

-- DropTable
DROP TABLE "OrderEvidence";

-- DropTable
DROP TABLE "OrderNote";

-- DropTable
DROP TABLE "OrderStatusHistory";

-- DropTable
DROP TABLE "OrderStop";

-- DropTable
DROP TABLE "Place";

-- DropTable
DROP TABLE "Price";

-- DropTable
DROP TABLE "StripeCheckout";

-- DropTable
DROP TABLE "StripeIdenety";

-- DropTable
DROP TABLE "StripePaymentMethod";

-- DropTable
DROP TABLE "Tip";

-- DropTable
DROP TABLE "Vehicle";

-- DropTable
DROP TABLE "VehiclePhotos";

-- DropEnum
DROP TYPE "LoadType";

-- DropEnum
DROP TYPE "OredrStatus";

-- DropEnum
DROP TYPE "OredrType";

-- DropEnum
DROP TYPE "TipType";

-- DropEnum
DROP TYPE "VehicleTier";

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'UAE',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "heroCopy" TEXT,
    "insiderData" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poi" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "type" "PoiType" NOT NULL,
    "cityId" TEXT NOT NULL,
    "areaId" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Poi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmenityCatalog" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" "AmenityCategory" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AmenityCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessibilityFeature" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" "AccessibilityCategory" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AccessibilityFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_accountId_key" ON "Guest"("accountId");

-- CreateIndex
CREATE INDEX "Guest_createdAt_idx" ON "Guest"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Host_accountId_key" ON "Host"("accountId");

-- CreateIndex
CREATE INDEX "Host_createdAt_idx" ON "Host"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "City_createdAt_idx" ON "City"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Area_createdAt_idx" ON "Area"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Area_cityId_slug_key" ON "Area"("cityId", "slug");

-- CreateIndex
CREATE INDEX "Poi_createdAt_idx" ON "Poi"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "AmenityCatalog_key_key" ON "AmenityCatalog"("key");

-- CreateIndex
CREATE INDEX "AmenityCatalog_category_deleted_idx" ON "AmenityCatalog"("category", "deleted");

-- CreateIndex
CREATE UNIQUE INDEX "AccessibilityFeature_key_key" ON "AccessibilityFeature"("key");

-- CreateIndex
CREATE INDEX "AccessibilityFeature_category_deleted_idx" ON "AccessibilityFeature"("category", "deleted");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poi" ADD CONSTRAINT "Poi_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poi" ADD CONSTRAINT "Poi_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

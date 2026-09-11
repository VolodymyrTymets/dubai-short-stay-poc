-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "AccountRoleType" AS ENUM ('CUSTOMER', 'DRIVER', 'ADMIN', 'SUPPORT', 'SYSTEM', 'AGENT');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMG', 'VIDEO');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('FILE_STATUS_CREATED', 'FILE_STATUS_UPLOAD_IN_PROGRESS', 'FILE_STATUS_UPLOAD_COMPLETED', 'FILE_STATUS_UPLOAD_FAILED');

-- CreateEnum
CREATE TYPE "LoadType" AS ENUM ('HOUSE_HOLD', 'YARD_WASTE', 'RENOVATION_DEBRIS');

-- CreateEnum
CREATE TYPE "OredrType" AS ENUM ('HAULING', 'JUNK_REMOVAL');

-- CreateEnum
CREATE TYPE "OredrStatus" AS ENUM ('REQUESTED', 'MATCHING', 'OFFERED', 'ACCEPTED', 'EN_ROUTE_PICKUP', 'ARRIVED_PICKUP', 'LOADING', 'EN_ROUTE_DROPOFF', 'ARRIVED_DROPOFF', 'UNLOADING', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TipType" AS ENUM ('BEFORE', 'AFTER');

-- CreateEnum
CREATE TYPE "VehicleTier" AS ENUM ('SUV', 'VAN', 'TRUCK');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3) NOT NULL,
    "lastAccountRoleId" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountRole" (
    "id" TEXT NOT NULL,
    "type" "AccountRoleType" NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AccountRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountOnRole" (
    "roleId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AccountOnRole_pkey" PRIMARY KEY ("roleId","accountId")
);

-- CreateTable
CREATE TABLE "AccountIdentity" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "hash" TEXT,
    "salt" TEXT,
    "otpHash" TEXT,
    "otpSalt" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AccountIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountProfile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT,
    "lastName" TEXT,
    "middleName" TEXT,
    "dataOfBirth" TEXT,
    "SSN" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "is18YearOld" BOOLEAN NOT NULL DEFAULT false,
    "avatarId" TEXT,

    CONSTRAINT "AccountProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "accountId" TEXT NOT NULL,
    "driverLicenseId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "isVerifield" BOOLEAN NOT NULL DEFAULT false,
    "defaultAddressId" TEXT NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverLicense" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DriverLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverLicensePhoto" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "driverLicenseId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "isFront" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "DriverLicensePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "key" TEXT,
    "mimeType" TEXT,
    "size" INTEGER NOT NULL DEFAULT 0,
    "status" "FileStatus" NOT NULL DEFAULT 'FILE_STATUS_CREATED',
    "createdById" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JunkRemovalItem" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "fileId" TEXT,

    CONSTRAINT "JunkRemovalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JunkRemovalItemInOrder" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT NOT NULL,
    "junkRemovalItemId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "priceId" TEXT NOT NULL,

    CONSTRAINT "JunkRemovalItemInOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JunkRemovalOrderDetatils" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "loadType" "LoadType" NOT NULL,
    "isNeedSpecialDesposal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JunkRemovalOrderDetatils_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "notificationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("notificationId","accountId")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "customerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" "OredrStatus" NOT NULL,
    "type" "OredrType" NOT NULL,
    "vehicleTier" "VehicleTier" NOT NULL,
    "isTwoPersone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStop" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "index" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OrderStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderEvidence" (
    "orderId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderEvidence_pkey" PRIMARY KEY ("orderId","fileId")
);

-- CreateTable
CREATE TABLE "OrderNote" (
    "id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "from" "OredrStatus" NOT NULL,
    "to" "OredrStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeIdenety" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "stripeAccountId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "charges_enabled" BOOLEAN NOT NULL DEFAULT false,
    "payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StripeIdenety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeCheckout" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "stripe_checkout_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "amount_subtotal" INTEGER NOT NULL,
    "amount_total" INTEGER NOT NULL,
    "failedReason" TEXT,

    CONSTRAINT "StripeCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripePaymentMethod" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "stripe_payment_method_id" TEXT NOT NULL,
    "lastNumbers" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StripePaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "type" "TipType" NOT NULL,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderCheckout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeCheckoutId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "regularPriceId" TEXT NOT NULL,
    "totalPriceId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrderCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(9,2) NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdBy" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,

    CONSTRAINT "DriverReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeletedHistory" (
    "id" TEXT NOT NULL,
    "relationId" TEXT NOT NULL,
    "deletedAt" BOOLEAN NOT NULL,
    "deletedBy" TEXT,

    CONSTRAINT "DeletedHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Migration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "successful" BOOLEAN NOT NULL DEFAULT false,
    "result" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Migration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "formattedAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "point" geography(Point, 4326) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentDriverLocation" (
    "locationId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CurrentDriverLocation_pkey" PRIMARY KEY ("locationId","driverId")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "driverId" TEXT NOT NULL,
    "tier" "VehicleTier" NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "plate_state" TEXT NOT NULL,
    "cargo_length_in" DOUBLE PRECISION NOT NULL,
    "cargo_width_in" DOUBLE PRECISION NOT NULL,
    "cargo_height_in" DOUBLE PRECISION NOT NULL,
    "max_weight_lbs" DOUBLE PRECISION NOT NULL,
    "has_tonneau" BOOLEAN NOT NULL DEFAULT false,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclePhotos" (
    "vehicleId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VehiclePhotos_pkey" PRIMARY KEY ("vehicleId","fileId")
);

-- CreateIndex
CREATE INDEX "Account_createdAt_idx" ON "Account"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "AccountRole_type_key" ON "AccountRole"("type");

-- CreateIndex
CREATE INDEX "AccountRole_type_deleted_idx" ON "AccountRole"("type", "deleted");

-- CreateIndex
CREATE INDEX "AccountOnRole_deleted_idx" ON "AccountOnRole"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "AccountIdentity_accountId_key" ON "AccountIdentity"("accountId");

-- CreateIndex
CREATE INDEX "AccountIdentity_deleted_idx" ON "AccountIdentity"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "AccountProfile_accountId_key" ON "AccountProfile"("accountId");

-- CreateIndex
CREATE INDEX "AccountProfile_deleted_idx" ON "AccountProfile"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_accountId_key" ON "Driver"("accountId");

-- CreateIndex
CREATE INDEX "Driver_createdAt_isOnline_isVerifield_idx" ON "Driver"("createdAt" DESC, "isOnline", "isVerifield");

-- CreateIndex
CREATE INDEX "DriverLicensePhoto_driverLicenseId_idx" ON "DriverLicensePhoto"("driverLicenseId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_accountId_key" ON "Customer"("accountId");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "File_createdAt_mimeType_status_idx" ON "File"("createdAt" DESC, "mimeType", "status");

-- CreateIndex
CREATE INDEX "JunkRemovalItem_fileId_idx" ON "JunkRemovalItem"("fileId");

-- CreateIndex
CREATE INDEX "JunkRemovalItemInOrder_orderId_priceId_idx" ON "JunkRemovalItemInOrder"("orderId", "priceId");

-- CreateIndex
CREATE INDEX "JunkRemovalOrderDetatils_orderId_idx" ON "JunkRemovalOrderDetatils"("orderId");

-- CreateIndex
CREATE INDEX "Order_createdAt_type_status_idx" ON "Order"("createdAt" DESC, "type", "status");

-- CreateIndex
CREATE INDEX "OrderStop_orderId_placeId_deleted_idx" ON "OrderStop"("orderId", "placeId", "deleted");

-- CreateIndex
CREATE UNIQUE INDEX "OrderNote_orderId_key" ON "OrderNote"("orderId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_createdAt_orderId_idx" ON "OrderStatusHistory"("createdAt" DESC, "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeIdenety_accountId_key" ON "StripeIdenety"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeIdenety_stripeAccountId_key" ON "StripeIdenety"("stripeAccountId");

-- CreateIndex
CREATE INDEX "StripeIdenety_onboarding_complete_deleted_idx" ON "StripeIdenety"("onboarding_complete", "deleted");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCheckout_accountId_key" ON "StripeCheckout"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCheckout_stripe_checkout_id_key" ON "StripeCheckout"("stripe_checkout_id");

-- CreateIndex
CREATE INDEX "StripeCheckout_status_deleted_idx" ON "StripeCheckout"("status", "deleted");

-- CreateIndex
CREATE UNIQUE INDEX "StripePaymentMethod_accountId_key" ON "StripePaymentMethod"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "StripePaymentMethod_stripe_payment_method_id_key" ON "StripePaymentMethod"("stripe_payment_method_id");

-- CreateIndex
CREATE INDEX "StripePaymentMethod_accountId_isDefault_deleted_idx" ON "StripePaymentMethod"("accountId", "isDefault", "deleted");

-- CreateIndex
CREATE INDEX "Tip_orderId_priceId_type_deleted_idx" ON "Tip"("orderId", "priceId", "type", "deleted");

-- CreateIndex
CREATE UNIQUE INDEX "OrderCheckout_stripeCheckoutId_key" ON "OrderCheckout"("stripeCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderCheckout_orderId_key" ON "OrderCheckout"("orderId");

-- CreateIndex
CREATE INDEX "OrderCheckout_totalPriceId_orderId_stripeCheckoutId_deleted_idx" ON "OrderCheckout"("totalPriceId", "orderId", "stripeCheckoutId", "deleted");

-- CreateIndex
CREATE INDEX "Price_deleted_idx" ON "Price"("deleted");

-- CreateIndex
CREATE INDEX "DeletedHistory_relationId_idx" ON "DeletedHistory"("relationId");

-- CreateIndex
CREATE UNIQUE INDEX "Place_place_id_key" ON "Place"("place_id");

-- CreateIndex
CREATE UNIQUE INDEX "Place_locationId_key" ON "Place"("locationId");

-- CreateIndex
CREATE INDEX "Place_place_id_deleted_idx" ON "Place"("place_id", "deleted");

-- CreateIndex
CREATE INDEX "Location_deleted_idx" ON "Location"("deleted");

-- CreateIndex
CREATE INDEX "Location_point_idx" ON "Location" USING GIST ("point");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentDriverLocation_locationId_key" ON "CurrentDriverLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "CurrentDriverLocation_driverId_key" ON "CurrentDriverLocation"("driverId");

-- CreateIndex
CREATE INDEX "CurrentDriverLocation_deleted_idx" ON "CurrentDriverLocation"("deleted");

-- CreateIndex
CREATE INDEX "Address_deleted_idx" ON "Address"("deleted");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_lastAccountRoleId_fkey" FOREIGN KEY ("lastAccountRoleId") REFERENCES "AccountRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountOnRole" ADD CONSTRAINT "AccountOnRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AccountRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountOnRole" ADD CONSTRAINT "AccountOnRole_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountIdentity" ADD CONSTRAINT "AccountIdentity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountProfile" ADD CONSTRAINT "AccountProfile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountProfile" ADD CONSTRAINT "AccountProfile_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_driverLicenseId_fkey" FOREIGN KEY ("driverLicenseId") REFERENCES "DriverLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_defaultAddressId_fkey" FOREIGN KEY ("defaultAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLicensePhoto" ADD CONSTRAINT "DriverLicensePhoto_driverLicenseId_fkey" FOREIGN KEY ("driverLicenseId") REFERENCES "DriverLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLicensePhoto" ADD CONSTRAINT "DriverLicensePhoto_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkRemovalItem" ADD CONSTRAINT "JunkRemovalItem_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkRemovalItemInOrder" ADD CONSTRAINT "JunkRemovalItemInOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkRemovalItemInOrder" ADD CONSTRAINT "JunkRemovalItemInOrder_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JunkRemovalOrderDetatils" ADD CONSTRAINT "JunkRemovalOrderDetatils_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStop" ADD CONSTRAINT "OrderStop_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStop" ADD CONSTRAINT "OrderStop_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvidence" ADD CONSTRAINT "OrderEvidence_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvidence" ADD CONSTRAINT "OrderEvidence_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderNote" ADD CONSTRAINT "OrderNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeIdenety" ADD CONSTRAINT "StripeIdenety_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeCheckout" ADD CONSTRAINT "StripeCheckout_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripePaymentMethod" ADD CONSTRAINT "StripePaymentMethod_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCheckout" ADD CONSTRAINT "OrderCheckout_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCheckout" ADD CONSTRAINT "OrderCheckout_regularPriceId_fkey" FOREIGN KEY ("regularPriceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCheckout" ADD CONSTRAINT "OrderCheckout_totalPriceId_fkey" FOREIGN KEY ("totalPriceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverReview" ADD CONSTRAINT "DriverReview_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverReview" ADD CONSTRAINT "DriverReview_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentDriverLocation" ADD CONSTRAINT "CurrentDriverLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentDriverLocation" ADD CONSTRAINT "CurrentDriverLocation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclePhotos" ADD CONSTRAINT "VehiclePhotos_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclePhotos" ADD CONSTRAINT "VehiclePhotos_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HostKycDocumentType" AS ENUM ('PASSPORT', 'EMIRATES_ID', 'TRADE_LICENSE', 'TITLE_DEED', 'EJARI', 'NOC', 'POA');

-- CreateTable
CREATE TABLE "HostProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "hostId" TEXT NOT NULL,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "taxResidency" TEXT,
    "bankAccountVerified" BOOLEAN NOT NULL DEFAULT false,
    "bankAccountEncrypted" TEXT,

    CONSTRAINT "HostProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostKycDocument" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "hostProfileId" TEXT NOT NULL,
    "type" "HostKycDocumentType" NOT NULL,
    "fileId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "HostKycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostProfile_hostId_key" ON "HostProfile"("hostId");

-- CreateIndex
CREATE INDEX "HostProfile_kycStatus_deleted_idx" ON "HostProfile"("kycStatus", "deleted");

-- CreateIndex
CREATE INDEX "HostKycDocument_hostProfileId_type_idx" ON "HostKycDocument"("hostProfileId", "type");

-- AddForeignKey
ALTER TABLE "HostProfile" ADD CONSTRAINT "HostProfile_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostKycDocument" ADD CONSTRAINT "HostKycDocument_hostProfileId_fkey" FOREIGN KEY ("hostProfileId") REFERENCES "HostProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostKycDocument" ADD CONSTRAINT "HostKycDocument_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

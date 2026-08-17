-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'LOCKED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "VolunteerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "VolunteerMemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "VolunteerEventStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "VolunteerEventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "VolunteerParticipationStatus" AS ENUM ('APPLIED', 'ATTENDED', 'ABSENT', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(128) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerApplication" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "birthDate" DATE NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "neighborhood" VARCHAR(100) NOT NULL,
    "preferredActivities" JSONB NOT NULL,
    "motivation" VARCHAR(2000) NOT NULL,
    "photoFileId" UUID,
    "status" "VolunteerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "adminMemo" TEXT,
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerMember" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "status" "VolunteerMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerFile" (
    "id" UUID NOT NULL,
    "objectKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerEvent" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageFileId" UUID NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "recruitmentDeadlineAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "supplies" TEXT,
    "precautions" TEXT,
    "status" "VolunteerEventStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "VolunteerEventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "closeReason" TEXT,
    "cancelReason" TEXT,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerParticipation" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "status" "VolunteerParticipationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3),
    "attendanceCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "RefreshSession_userId_revokedAt_idx" ON "RefreshSession"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "RefreshSession_expiresAt_idx" ON "RefreshSession"("expiresAt");

-- CreateIndex
CREATE INDEX "VolunteerApplication_userId_status_idx" ON "VolunteerApplication"("userId", "status");

-- CreateIndex
CREATE INDEX "VolunteerApplication_status_createdAt_idx" ON "VolunteerApplication"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerMember_userId_key" ON "VolunteerMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerMember_applicationId_key" ON "VolunteerMember"("applicationId");

-- CreateIndex
CREATE INDEX "VolunteerMember_status_joinedAt_idx" ON "VolunteerMember"("status", "joinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerFile_objectKey_key" ON "VolunteerFile"("objectKey");

-- CreateIndex
CREATE INDEX "VolunteerEvent_status_startAt_idx" ON "VolunteerEvent"("status", "startAt");

-- CreateIndex
CREATE INDEX "VolunteerEvent_visibility_recruitmentDeadlineAt_idx" ON "VolunteerEvent"("visibility", "recruitmentDeadlineAt");

-- CreateIndex
CREATE INDEX "VolunteerParticipation_memberId_status_idx" ON "VolunteerParticipation"("memberId", "status");

-- CreateIndex
CREATE INDEX "VolunteerParticipation_eventId_status_idx" ON "VolunteerParticipation"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerParticipation_eventId_memberId_key" ON "VolunteerParticipation"("eventId", "memberId");

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerMember" ADD CONSTRAINT "VolunteerMember_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "VolunteerApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerEvent" ADD CONSTRAINT "VolunteerEvent_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "VolunteerFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerParticipation" ADD CONSTRAINT "VolunteerParticipation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "VolunteerEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerParticipation" ADD CONSTRAINT "VolunteerParticipation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "VolunteerMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

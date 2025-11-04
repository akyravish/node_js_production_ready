/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "MasterAccount" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "by_bit_uid" TEXT NOT NULL,
    "by_bit_api_key" TEXT NOT NULL,
    "by_bit_api_secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowerAccount" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "by_bit_uid" TEXT NOT NULL,
    "by_bit_api_key" TEXT NOT NULL,
    "by_bit_api_secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterAccount_email_key" ON "MasterAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MasterAccount_by_bit_uid_key" ON "MasterAccount"("by_bit_uid");

-- CreateIndex
CREATE INDEX "MasterAccount_user_id_idx" ON "MasterAccount"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "FollowerAccount_email_key" ON "FollowerAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FollowerAccount_by_bit_uid_key" ON "FollowerAccount"("by_bit_uid");

-- CreateIndex
CREATE INDEX "FollowerAccount_user_id_idx" ON "FollowerAccount"("user_id");

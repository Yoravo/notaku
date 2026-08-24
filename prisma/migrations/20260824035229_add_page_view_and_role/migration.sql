/*
  Warnings:

  - A unique constraint covering the columns `[userId,number]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "page_view" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_view_path_idx" ON "page_view"("path");

-- CreateIndex
CREATE INDEX "page_view_createdAt_idx" ON "page_view"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_userId_number_key" ON "Invoice"("userId", "number");

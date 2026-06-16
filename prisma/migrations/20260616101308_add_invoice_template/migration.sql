-- CreateEnum
CREATE TYPE "InvoiceTemplate" AS ENUM ('CLASSIC', 'MODERN', 'MINIMAL');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "invoiceTemplate" "InvoiceTemplate" NOT NULL DEFAULT 'CLASSIC';

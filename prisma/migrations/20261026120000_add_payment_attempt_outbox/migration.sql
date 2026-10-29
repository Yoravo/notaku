-- CreateEnum
CREATE TYPE "PaymentEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('SUBSCRIPTION', 'INVOICE');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATING', 'PENDING', 'CREATE_UNKNOWN', 'RECONCILING', 'PAID', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "payment_attempt" (
    "id" TEXT NOT NULL,
    "environment" "PaymentEnvironment" NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "plan" "Plan",
    "intervalDays" INTEGER,
    "promoCode" TEXT,
    "promoReservedAt" TIMESTAMP(3),
    "promoConsumedAt" TIMESTAMP(3),
    "merchantIdSnapshot" TEXT NOT NULL,
    "gaMeasurementId" TEXT,
    "gaClientId" TEXT,
    "gaSessionId" TEXT,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATING',
    "providerPaymentId" TEXT,
    "providerTransactionId" TEXT,
    "paymentUrl" TEXT,
    "returnUrl" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "activeCheckoutKey" TEXT,
    "reconcileAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastReconciledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_outbox" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempt_providerTransactionId_key" ON "payment_attempt"("providerTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempt_activeCheckoutKey_key" ON "payment_attempt"("activeCheckoutKey");

-- CreateIndex
CREATE INDEX "payment_attempt_providerPaymentId_idx" ON "payment_attempt"("providerPaymentId");

-- CreateIndex
CREATE INDEX "payment_attempt_userId_purpose_status_idx" ON "payment_attempt"("userId", "purpose", "status");

-- CreateIndex
CREATE INDEX "payment_attempt_invoiceId_status_idx" ON "payment_attempt"("invoiceId", "status");

-- CreateIndex
CREATE INDEX "payment_attempt_createdAt_idx" ON "payment_attempt"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_outbox_idempotencyKey_key" ON "payment_outbox"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payment_outbox_deliveredAt_availableAt_idx" ON "payment_outbox"("deliveredAt", "availableAt");

-- CreateIndex
CREATE INDEX "payment_outbox_attemptId_idx" ON "payment_outbox"("attemptId");

-- AddForeignKey
ALTER TABLE "payment_attempt" ADD CONSTRAINT "payment_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempt" ADD CONSTRAINT "payment_attempt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_outbox" ADD CONSTRAINT "payment_outbox_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "payment_attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_outbox" ADD CONSTRAINT "payment_outbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

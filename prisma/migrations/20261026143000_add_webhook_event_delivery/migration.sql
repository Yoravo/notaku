-- A stable event ID makes each endpoint delivery independently retryable.
ALTER TABLE "webhook_log" ADD COLUMN "eventId" TEXT;

CREATE UNIQUE INDEX "webhook_log_endpointId_eventId_key"
ON "webhook_log"("endpointId", "eventId");

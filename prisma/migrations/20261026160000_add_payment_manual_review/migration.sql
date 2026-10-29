-- Add durable state for ambiguous checkout creation without provider references.
ALTER TYPE "PaymentAttemptStatus" ADD VALUE 'MANUAL_REVIEW' AFTER 'CREATE_UNKNOWN';

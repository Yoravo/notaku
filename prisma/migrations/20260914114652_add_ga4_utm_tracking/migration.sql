-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "gaClientId" TEXT,
ADD COLUMN     "gaSessionId" TEXT,
ADD COLUMN     "upgradeEventAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "page_view" ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmSource" TEXT;

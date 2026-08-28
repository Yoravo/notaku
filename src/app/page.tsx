import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LandingAnnouncementBanner } from "@/components/landing-announcement-banner";
import { HomeClient } from "@/components/home-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <HomeClient
      session={session}
      announcementBanner={<LandingAnnouncementBanner />}
    />
  );
}

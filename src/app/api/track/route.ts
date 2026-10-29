import { parseTrafficPayload } from "@/lib/admin-analytics";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = parseTrafficPayload(await request.json());
    if (!payload) {
      return NextResponse.json({ error: "Invalid tracking payload" }, { status: 400 });
    }

    if (payload.path.startsWith("/admin") || payload.path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || null;
    const ipAddress =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip")?.trim() ||
      null;
    const rateLimitIdentifier = ipAddress || userAgent?.slice(0, 100) || "anonymous";

    if (!(await checkRateLimit(`track:${rateLimitIdentifier}`, 60, 60))) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    if (ipAddress) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentView = await prisma.pageView.findFirst({
        where: {
          ipAddress: ipAddress.slice(0, 45),
          path: payload.path,
          createdAt: { gte: thirtyMinutesAgo },
        },
        select: { id: true },
      });

      if (recentView) {
        return NextResponse.json({ ok: true, deduplicated: true });
      }
    }

    await prisma.pageView.create({
      data: {
        path: payload.path,
        referrer: payload.referrer,
        userAgent: userAgent?.slice(0, 255) || null,
        ipAddress: ipAddress?.slice(0, 45) || null,
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        utmCampaign: payload.utmCampaign,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
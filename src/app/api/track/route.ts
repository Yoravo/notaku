import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { path, referrer } = await request.json();
    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || null;
    const ipAddress =
      headerList.get("x-forwarded-for")?.split(",")[0] ||
      headerList.get("x-real-ip") ||
      null;

    const normalizedPath = path.slice(0, 255);

    // Anti-spam / Cooldown: abaikan refresh halaman yang sama dari IP yang sama dalam jeda 30 menit
    if (ipAddress) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentView = await prisma.pageView.findFirst({
        where: {
          ipAddress,
          path: normalizedPath,
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
        path: normalizedPath,
        referrer: referrer ? referrer.slice(0, 500) : null,
        userAgent: userAgent ? userAgent.slice(0, 255) : null,
        ipAddress: ipAddress ? ipAddress.slice(0, 45) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
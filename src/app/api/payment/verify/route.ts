import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
if (!MIDTRANS_SERVER_KEY) {
  throw new Error("MIDTRANS_SERVER_KEY is not configured");
}
const MIDTRANS_API_URL =
  process.env.MIDTRANS_API_URL || "https://app.midtrans.com/snap/v1";

function getCoreApiBaseUrl() {
  const isProduction = MIDTRANS_API_URL.includes("app.midtrans.com");
  return isProduction
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.midtransOrderId) {
    return NextResponse.json({ status: "no_pending_payment" });
  }

  // Sudah aktif?
  if (subscription.status === "ACTIVE") {
    return NextResponse.json({ status: "active" });
  }

  // Cek status ke Midtrans Core API
  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
  const baseUrl = getCoreApiBaseUrl();

  try {
    const res = await fetch(
      `${baseUrl}/${subscription.midtransOrderId}/status`,
      {
        headers: { Authorization: `Basic ${authString}` },
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Midtrans status check failed:", res.status, errorText);
      return NextResponse.json({
        status: "error",
        message: "Gagal cek status",
      });
    }

    const data = await res.json();
    const isSettlement =
      data.transaction_status === "settlement" ||
      data.transaction_status === "capture";
    const isFraudOk = data.fraud_status === "accept" || !data.fraud_status;

    if (isSettlement && isFraudOk) {
      const result = await prisma.$transaction(async (tx) => {
        const fresh = await tx.subscription.findUnique({
          where: { id: subscription.id },
        });
        if (!fresh) return "not_found";

        // Already activated by webhook — skip
        if (fresh.status === "ACTIVE") return "already_active";

        const base = fresh.currentPeriodEnd ?? new Date();
        const currentPeriodEnd = new Date(base);
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

        await tx.subscription.update({
          where: { id: subscription.id },
          data: { status: "ACTIVE", currentPeriodEnd },
        });
        await tx.user.update({
          where: { id: subscription.userId },
          data: { plan: "PRO" },
        });

        return "activated";
      });

      return NextResponse.json({ status: result });
    }

    return NextResponse.json({
      status: data.transaction_status,
      message: `Status: ${data.transaction_status}`,
    });
  } catch (err) {
    console.error("Midtrans status check error:", err);
    return NextResponse.json({
      status: "error",
      message: "Gagal hubungi Midtrans",
    });
  }
}

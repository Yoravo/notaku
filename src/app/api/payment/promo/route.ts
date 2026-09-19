import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { validatePromoCode, getPlanPrice, type PlanType, type PlanInterval } from "@/lib/promos";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const code = String(body.code || "").trim();
    const plan: PlanType = body.plan === "BUSINESS" ? "BUSINESS" : "PRO";
    const interval: PlanInterval = body.interval === "ANNUALLY" ? "ANNUALLY" : "MONTHLY";

    if (!code) {
      return NextResponse.json(
        { error: "Kode voucher wajib diisi" },
        { status: 400 }
      );
    }

    const basePrice = getPlanPrice(plan, interval);
    const result = await validatePromoCode(code, basePrice);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error validating promo:", err);
    return NextResponse.json(
      { error: "Gagal memproses kode promo" },
      { status: 500 }
    );
  }
}

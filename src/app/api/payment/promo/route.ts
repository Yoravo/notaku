import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promos";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const code = String(body.code || "").trim();

    if (!code) {
      return NextResponse.json(
        { error: "Kode voucher wajib diisi" },
        { status: 400 }
      );
    }

    const result = await validatePromoCode(code);
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

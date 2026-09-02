import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

async function authenticateRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const apiKeyHeader = request.headers.get("x-api-key");

  let rawKey = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    rawKey = authHeader.replace("Bearer ", "").trim();
  } else if (apiKeyHeader) {
    rawKey = apiKeyHeader.trim();
  }

  if (!rawKey) {
    return { error: "Missing API Key. Provide Authorization: Bearer <ntk_live_...> or x-api-key header.", status: 401 };
  }

  const keyRecord = await validateApiKey(rawKey);
  if (!keyRecord) {
    return { error: "Invalid or inactive API Key.", status: 401 };
  }

  if (keyRecord.user.plan !== "PRO") {
    return { error: "Developer API is only available for NotaKu PRO accounts.", status: 403 };
  }

  const isRateLimitOk = await checkRateLimit(`api:key:${keyRecord.id}`, 120, 60);
  if (!isRateLimitOk) {
    return { error: "Rate limit exceeded (Max 120 requests/minute).", status: 429 };
  }

  return { user: keyRecord.user, keyRecord };
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const authRes = await authenticateRequest(request);
  if ("error" in authRes) {
    return NextResponse.json({ success: false, error: authRes.error }, { status: authRes.status });
  }

  const { user } = authRes;
  const { id } = await props.params;

  const invoice = await prisma.invoice.findFirst({
    where: {
      userId: user.id,
      OR: [{ id }, { publicId: id }, { number: id }],
    },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
  const publicUrl = `${baseUrl}/i/${invoice.publicId}`;
  const pdfUrl = `${baseUrl}/api/invoices/public/${invoice.publicId}/pdf`;
  const receiptUrl =
    invoice.status === "PAID" ? `${baseUrl}/api/invoices/public/${invoice.publicId}/receipt` : null;

  return NextResponse.json({
    success: true,
    data: {
      id: invoice.id,
      publicId: invoice.publicId,
      number: invoice.number,
      status: invoice.status,
      customer: {
        id: invoice.customer.id,
        name: invoice.customer.name,
        email: invoice.customer.email,
        phone: invoice.customer.phone,
        address: invoice.customer.address,
      },
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString().split("T")[0] : null,
      notes: invoice.notes,
      currency: invoice.currency,
      subtotal: Number(invoice.subtotal),
      discountType: invoice.discountType,
      discountValue: Number(invoice.discountValue),
      discountAmount: Number(invoice.discountAmount),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      paymentMethod: invoice.paymentMethod,
      paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
      publicUrl,
      pdfUrl,
      receiptUrl,
      items: invoice.items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        price: Number(it.price),
        amount: Number(it.amount),
      })),
      createdAt: invoice.createdAt.toISOString(),
    },
  });
}

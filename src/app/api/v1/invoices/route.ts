import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";
import { dispatchWebhook } from "@/lib/webhook-dispatcher";
import { z } from "zod";

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

const createInvoiceApiSchema = z.object({
  customerId: z.string().optional(),
  customer: z
    .object({
      name: z.string().min(1, "Customer name is required"),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional().or(z.literal("")),
      address: z.string().optional().or(z.literal("")),
    })
    .optional(),
  dueDate: z.string().nullable().optional(),
  notes: z.string().max(1000).optional().nullable(),
  discountType: z.enum(["FIXED", "PERCENTAGE"]).default("FIXED"),
  discountValue: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  currency: z.enum(["IDR", "USD", "SGD", "EUR"]).default("IDR"),
  enableDirectTransfer: z.boolean().default(true),
  enableDigitalPayment: z.boolean().default(false),
  enableReminder: z.boolean().default(true),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Item description is required"),
        quantity: z.number().int().positive("Quantity must be positive"),
        price: z.number().nonnegative("Price cannot be negative"),
      })
    )
    .min(1, "At least 1 item is required"),
});

export async function GET(request: Request) {
  const authRes = await authenticateRequest(request);
  if ("error" in authRes) {
    return NextResponse.json({ success: false, error: authRes.error }, { status: authRes.status });
  }

  const { user } = authRes;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const skip = (page - 1) * limit;

  const whereClause: any = { userId: user.id };
  if (status) {
    whereClause.status = status;
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: true,
      },
    }),
    prisma.invoice.count({ where: whereClause }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

  return NextResponse.json({
    success: true,
    data: invoices.map((inv) => ({
      id: inv.id,
      publicId: inv.publicId,
      number: inv.number,
      status: inv.status,
      customer: inv.customer,
      dueDate: inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : null,
      notes: inv.notes,
      currency: inv.currency,
      subtotal: Number(inv.subtotal),
      discountAmount: Number(inv.discountAmount),
      taxAmount: Number(inv.taxAmount),
      total: Number(inv.total),
      publicUrl: `${baseUrl}/i/${inv.publicId}`,
      pdfUrl: `${baseUrl}/api/invoices/public/${inv.publicId}/pdf`,
      receiptUrl: inv.status === "PAID" ? `${baseUrl}/api/invoices/public/${inv.publicId}/receipt` : null,
      createdAt: inv.createdAt.toISOString(),
      items: inv.items.map((it) => ({
        id: it.id,
        description: it.description,
        quantity: it.quantity,
        price: Number(it.price),
        amount: Number(it.amount),
      })),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  const authRes = await authenticateRequest(request);
  if ("error" in authRes) {
    return NextResponse.json({ success: false, error: authRes.error }, { status: authRes.status });
  }

  const { user } = authRes;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createInvoiceApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  const input = parsed.data;

  // Resolve customer: either customerId or create new customer
  let targetCustomerId = input.customerId;

  if (!targetCustomerId && input.customer) {
    const newCust = await prisma.customer.create({
      data: {
        userId: user.id,
        name: input.customer.name,
        email: input.customer.email || null,
        phone: input.customer.phone || null,
        address: input.customer.address || null,
      },
    });
    targetCustomerId = newCust.id;
  }

  if (!targetCustomerId) {
    return NextResponse.json(
      { success: false, error: "Either customerId or customer object is required" },
      { status: 400 }
    );
  }

  const customerExists = await prisma.customer.findUnique({
    where: { id: targetCustomerId, userId: user.id },
  });

  if (!customerExists) {
    return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
  }

  const totals = calculateInvoiceTotals({
    items: input.items,
    discountType: input.discountType,
    discountValue: input.discountValue,
    taxRate: input.taxRate,
  });

  const invoice = await prisma.$transaction(async (tx) => {
    const number = await generateInvoiceNumber(user.id, tx);

    return tx.invoice.create({
      data: {
        userId: user.id,
        customerId: targetCustomerId,
        number,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes || null,
        subtotal: totals.subtotal,
        discountType: totals.discountType,
        discountValue: totals.discountValue,
        discountAmount: totals.discountAmount,
        taxRate: totals.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        currency: input.currency,
        enableDirectTransfer: input.enableDirectTransfer,
        enableDigitalPayment: input.enableDigitalPayment,
        enableReminder: input.enableReminder,
        items: {
          create: input.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            amount: Math.round(item.quantity * item.price),
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
  const publicUrl = `${baseUrl}/i/${invoice.publicId}`;
  const pdfUrl = `${baseUrl}/api/invoices/public/${invoice.publicId}/pdf`;

  // Dispatch webhook event
  dispatchWebhook(user.id, "invoice.created", {
    id: invoice.id,
    publicId: invoice.publicId,
    number: invoice.number,
    status: invoice.status,
    total: Number(invoice.total),
    currency: invoice.currency,
    customer: {
      id: invoice.customer.id,
      name: invoice.customer.name,
      email: invoice.customer.email,
    },
    publicUrl,
  });

  return NextResponse.json(
    {
      success: true,
      message: "Invoice created successfully via Developer API",
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
        },
        dueDate: invoice.dueDate ? invoice.dueDate.toISOString().split("T")[0] : null,
        currency: invoice.currency,
        subtotal: Number(invoice.subtotal),
        discountAmount: Number(invoice.discountAmount),
        taxAmount: Number(invoice.taxAmount),
        total: Number(invoice.total),
        publicUrl,
        pdfUrl,
        items: invoice.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          price: Number(it.price),
          amount: Number(it.amount),
        })),
        createdAt: invoice.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}

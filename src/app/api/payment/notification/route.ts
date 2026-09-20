import { prisma } from "@/lib/prisma";
import { after, NextResponse } from "next/server";
import { auditLog } from "@/lib/audit-log";
import { dispatchWebhook } from "@/lib/webhook-dispatcher";
import { notifySellerInvoicePaid } from "@/lib/bot-notifications";
import { notifyAdminNewSubscription } from "@/lib/admin-notifications";
import crypto from "crypto";

export async function GET() {
  return new Response("Mayar Webhook Endpoint Active", { status: 200 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const tokenHeader =
      request.headers.get("x-mayar-token") ||
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.headers.get("webhook-token");

    const expectedToken = process.env.MAYAR_WEBHOOK_TOKEN;

    // Fail-closed: tolak semua request jika secret token belum dikonfigurasi di server
    // agar endpoint tidak pernah memproses payload tanpa verifikasi (mencegah settlement palsu).
    if (!expectedToken) {
      console.error("[SECURITY] MAYAR_WEBHOOK_TOKEN belum dikonfigurasi. Webhook ditolak demi keamanan.");
      auditLog("payment.webhook_unauthorized", { reason: "Server webhook secret not configured" });
      return NextResponse.json({ error: "Webhook verification unavailable" }, { status: 503 });
    }

    // Verifikasi Webhook Token: WAJIB ada dan valid (timing-safe)
    if (!tokenHeader) {
      auditLog("payment.webhook_unauthorized", { reason: "Missing token header" });
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const a = Buffer.from(tokenHeader);
    const b = Buffer.from(expectedToken);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      auditLog("payment.webhook_unauthorized", { reason: "Invalid token value" });
      return NextResponse.json({ error: "Unauthorized token" }, { status: 401 });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Payload Mayar: { event: "payment.received" | "payment.settled" | "payment.success", data: { ... } }
    const event = payload.event || payload.status;
    const data = payload.data || payload;

    const customerEmail =
      data.customerEmail ||
      data.customer?.email ||
      data.customer_email ||
      data.email;
    const paymentId = data.id || data.paymentId || data.transactionId;
    const orderId = data.orderId || data.order_id || data.referenceId;
    const status = data.status || event;
    const amount = Number(data.amount || 0);

    const isSuccess =
      event === "payment.received" ||
      event === "payment.settled" ||
      event === "payment.success" ||
      event === "transaction.success" ||
      status === "PAID" ||
      status === "SETTLED" ||
      status === "SUCCESS";

    if (isSuccess) {
      // 1. Cek apakah ini adalah Pembayaran Tagihan Invoice Pelanggan (NotaKu Digital Payment)
      let invoice = null;
      if (paymentId || orderId) {
        invoice = await prisma.invoice.findFirst({
          where: {
            OR: [
              ...(paymentId ? [{ mayarPaymentId: String(paymentId) }] : []),
              ...(orderId ? [{ mayarPaymentId: String(orderId) }] : []),
            ],
          },
          include: { user: true, customer: true },
        });
      }

      if (invoice) {
        // Idempotency: Jika invoice sudah lunas, jangan proses ulang saldo
        if (invoice.status === "PAID") {
          return NextResponse.json({ message: "Invoice already settled as PAID" });
        }

        const grossAmount = Number(invoice.total);
        // MDR QRIS/VA Mayar: 0.7% dipotong dari saldo penjual
        const feeAmount = Math.round(grossAmount * 0.007);
        const netAmount = Math.max(0, grossAmount - feeAmount);

        await prisma.$transaction(async (tx) => {
          // Update status invoice
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              status: "PAID",
              paidAt: new Date(),
              paymentMethod: "NOTAKU_DIGITAL",
            },
          });

          // Tambah saldo bersih ke rekening pengguna
          await tx.user.update({
            where: { id: invoice.userId },
            data: {
              balance: {
                increment: netAmount,
              },
            },
          });

          // Catat entri mutasi Ledger Transaksi
          await tx.transaction.create({
            data: {
              userId: invoice.userId,
              invoiceId: invoice.id,
              type: "INVOICE_PAYMENT",
              amount: netAmount,
              grossAmount: grossAmount,
              feeAmount: feeAmount,
              description: `Pembayaran ${invoice.number} (${invoice.customer.name}) via QRIS/VA`,
              referenceId: String(paymentId || orderId),
            },
          });
        });

        auditLog("payment.invoice_digital_settled", {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          userId: invoice.userId,
          grossAmount,
          feeAmount,
          netAmount,
          paymentId: String(paymentId || orderId),
        });

        // Trigger user-configured webhook
        dispatchWebhook(invoice.userId, "invoice.paid", {
          id: invoice.id,
          publicId: invoice.publicId,
          number: invoice.number,
          status: "PAID",
          total: Number(invoice.total),
          currency: invoice.currency,
          customer: {
            id: invoice.customer.id,
            name: invoice.customer.name,
            email: invoice.customer.email,
          },
          paidAt: new Date().toISOString(),
          paymentMethod: "NOTAKU_DIGITAL",
        });

        // Trigger Bot Telegram & Discord Notifikasi Penjual (PRO)
        notifySellerInvoicePaid(invoice.userId, {
          number: invoice.number,
          publicId: invoice.publicId,
          total: Number(invoice.total),
          currency: invoice.currency,
          customerName: invoice.customer.name,
          paymentMethod: "NOTAKU_DIGITAL",
          paidAt: new Date(),
        }).catch((e) => console.error("[NOTIF_SELLER_ERROR]", e));

        return NextResponse.json({
          message: "Success: Invoice settled and seller balance credited",
          invoiceNumber: invoice.number,
          netAmount,
        });
      }

      // 2. Jika bukan invoice, proses Upgrade / Perpanjangan Langganan PRO User
      let user = null;

      // Cari user berdasarkan subscription payment ID atau email
      if (paymentId) {
        const sub = await prisma.subscription.findFirst({
          where: { midtransOrderId: String(paymentId) },
          include: { user: true },
        });
        if (sub?.user) {
          user = sub.user;
        }
      }

      if (!user && customerEmail) {
        user = await prisma.user.findUnique({
          where: { email: customerEmail.toLowerCase().trim() },
        });
      }

      if (!user) {
        auditLog("payment.user_not_found", { paymentId, customerEmail, amount });
        return NextResponse.json({ message: "User or Invoice not found for this transaction" });
      }

      // Upgrade / perpanjang masa aktif langganan (PRO atau BUSINESS)
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      // OWASP A04: Tentukan target tier dan durasi dari data tersimpan / prefix orderId
      const targetPlan: "PRO" | "BUSINESS" =
        existingSub?.plan === "BUSINESS" || String(orderId).startsWith("BUSINESS")
          ? "BUSINESS"
          : "PRO";

      const daysToAdd =
        existingSub?.intervalDays && existingSub.intervalDays > 0
          ? existingSub.intervalDays
          : String(orderId).includes("ANNUALLY") ? 365 : 30;

      const baseDate =
        existingSub?.currentPeriodEnd && existingSub.currentPeriodEnd > new Date()
          ? existingSub.currentPeriodEnd
          : new Date();

      const newPeriodEnd = new Date(baseDate);
      newPeriodEnd.setDate(newPeriodEnd.getDate() + daysToAdd);

      const isFirstUpgrade = !existingSub?.upgradeEventAt;
      const now = new Date();

      await prisma.$transaction([
        prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            midtransOrderId: String(paymentId || `MAYAR-${Date.now()}`),
            status: "ACTIVE",
            plan: targetPlan,
            intervalDays: daysToAdd,
            currentPeriodEnd: newPeriodEnd,
            upgradeEventAt: now,
          },
          update: {
            status: "ACTIVE",
            plan: targetPlan,
            intervalDays: daysToAdd,
            currentPeriodEnd: newPeriodEnd,
            midtransOrderId: String(paymentId || existingSub?.midtransOrderId),
            ...(isFirstUpgrade ? { upgradeEventAt: now } : {}),
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { plan: targetPlan },
        }),
      ]);

      // Cek apakah user ini terdaftar dari referral dan beri bonus ke referrer
      if (user.referredById) {
        try {
          const existingReward = await prisma.referralReward.findFirst({
            where: {
              referrerId: user.referredById,
              referredUserId: user.id,
              status: "COMPLETED",
            },
          });

          if (!existingReward) {
            const rewardAmount = 10000; // Rp 10.000 komisi saldo per upgrade PRO
            const referrer = await prisma.user.findUnique({
              where: { id: user.referredById },
              select: { id: true, name: true, email: true },
            });

            if (referrer) {
              await prisma.$transaction(async (tx) => {
                // 1. Tambah saldo dompet referrer
                await tx.user.update({
                  where: { id: referrer.id },
                  data: {
                    balance: { increment: rewardAmount },
                  },
                });

                // 2. Catat mutasi ledger transaksi
                await tx.transaction.create({
                  data: {
                    userId: referrer.id,
                    type: "REFERRAL_REWARD",
                    amount: rewardAmount,
                    grossAmount: rewardAmount,
                    feeAmount: 0,
                    description: `Bonus Komisi Referral: ${user.name || "Teman Anda"} upgrade ke Paket PRO`,
                    referenceId: `REF-${user.id.slice(0, 8)}`,
                  },
                });

                // 3. Catat history reward referral
                await tx.referralReward.create({
                  data: {
                    referrerId: referrer.id,
                    referredUserId: user.id,
                    amount: rewardAmount,
                    status: "COMPLETED",
                    notes: `Upgrade PRO oleh ${user.name} (${user.email})`,
                  },
                });
              });

              auditLog("referral.reward_settled", {
                referrerId: referrer.id,
                referredUserId: user.id,
                amount: rewardAmount,
              });
            }
          }
        } catch (refErr) {
          console.error("Gagal memproses bonus referral:", refErr);
        }
      }

      auditLog("payment.mayar_settlement", {
        userId: user.id,
        email: user.email,
        paymentId,
        amount,
        periodEnd: newPeriodEnd.toISOString(),
      });

      // Kirim alert langganan baru ke Discord Webhook admin (non-blocking)
      notifyAdminNewSubscription({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        plan: targetPlan,
        amount: Number(amount) || (targetPlan === "BUSINESS" ? 99000 : 49000),
        intervalDays: daysToAdd,
        paymentId: String(paymentId || orderId || "-"),
      }).catch((err) => console.error("[SUB_ADMIN_NOTIF_ERROR]", err));

      // GA4 Measurement Protocol: fire event upgrade_to_paid dari server
      const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-52C2DD26LB";
      const gaApiSecret = process.env.GA4_API_SECRET;

      if (gaApiSecret && isFirstUpgrade) {
        const gaClientId = existingSub?.gaClientId;

        if (!gaClientId) {
          console.warn(`[GA4] gaClientId kosong untuk user ${user.id}; event upgrade_to_paid dilewati agar tidak merusak atribusi GA4.`);
        } else {
          after(async () => {
            try {
              const params: Record<string, unknown> = {
                transaction_id: String(paymentId || orderId || `PRO-${user.id.slice(0, 8)}`),
                value: amount > 0 ? amount : 49000,
                currency: "IDR",
                debug_mode: 1,
                items: [
                  {
                    item_id: "notaku_pro_monthly",
                    item_name: "NotaKu PRO - 1 Bulan",
                    price: amount > 0 ? amount : 49000,
                    quantity: 1,
                  },
                ],
              };
              if (existingSub?.gaSessionId) {
                params.session_id = existingSub.gaSessionId;
              }

              await fetch(
                `https://www.google-analytics.com/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    client_id: gaClientId,
                    user_id: user.id,
                    events: [
                      {
                        name: "upgrade_to_paid",
                        params,
                      },
                    ],
                  }),
                }
              );
            } catch (gaErr) {
              console.error("[GA4_MEASUREMENT_PROTOCOL_ERROR]", gaErr);
            }
          });
        }
      } else if (!gaApiSecret) {
        console.warn("[GA4] GA4_API_SECRET belum diatur di .env; event upgrade_to_paid server dilewati.");
      }

      return NextResponse.json({ message: "Success: User upgraded to PRO" });
    }

    return NextResponse.json({ message: `Ignored event: ${event || status}` });
  } catch (err) {
    console.error("Mayar webhook processing error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

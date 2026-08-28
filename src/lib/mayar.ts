/**
 * Mayar.id API Client
 * Official Documentation: https://docs.mayar.id
 */

const MAYAR_API_URL = process.env.MAYAR_API_URL || "https://api.mayar.id/hl/v1";

function getMayarApiKey() {
  const key = process.env.MAYAR_API_KEY;
  if (!key) {
    throw new Error("MAYAR_API_KEY is not configured");
  }
  return key;
}

export type CreateMayarPaymentParams = {
  name: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  description?: string;
  redirectUrl?: string;
  orderId?: string;
};

export type MayarPaymentResponse = {
  statusCode?: number;
  status?: string;
  messages?: string;
  data?: {
    id: string;
    link: string;
    url?: string;
    paymentUrl?: string;
    amount: number;
    status?: string;
    transactionId?: string;
  };
};

/**
 * Buat Payment Link / Invoicing via Mayar.id Headless API
 */
export async function createMayarPayment(
  params: CreateMayarPaymentParams
): Promise<{ paymentUrl: string; paymentId: string }> {
  const apiKey = getMayarApiKey();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";
  const redirectUrl = params.redirectUrl || `${appUrl}/settings?payment=success`;

  const payload = {
    name: params.name,
    amount: params.amount,
    description:
      params.description || "Pembelian Paket Langganan NotaKu PRO (30 Hari)",
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerMobile: params.customerMobile || "081234567890",
    redirectUrl,
    expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 jam
  };

  const response = await fetch(`${MAYAR_API_URL}/payment/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Mayar API error:", response.status, errorText);
    throw new Error(`Mayar API Error: ${response.statusText} - ${errorText}`);
  }

  const result = (await response.json()) as MayarPaymentResponse;

  const paymentUrl =
    result.data?.link ||
    result.data?.url ||
    result.data?.paymentUrl ||
    (result as any).url ||
    (result as any).link;

  const paymentId = result.data?.id || (result as any).id || params.orderId || "";

  if (!paymentUrl) {
    console.error("Mayar response without URL:", result);
    throw new Error("Gagal mendapatkan tautan pembayaran dari Mayar");
  }

  return { paymentUrl, paymentId };
}

import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_API_URL =
  process.env.MIDTRANS_API_URL || "https://app.midtrans.com/snap/v1";

export async function createSnapToken(params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}) {
  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch(`${MIDTRANS_API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      callbacks: {
        finish: `${APP_URL}/settings`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Midtrans error: ${error}`);
  }

  const data = await response.json();
  return data.token as string;
}

export function verifySignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(
      `${params.orderId}${params.statusCode}${params.grossAmount}${MIDTRANS_SERVER_KEY}`,
    )
    .digest("hex");

  const a = Buffer.from(hash);
  const b = Buffer.from(params.signatureKey || "");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

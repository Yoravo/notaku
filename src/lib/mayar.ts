export type MayarEnvironment = "SANDBOX" | "PRODUCTION";

export type MayarConfig = {
  apiKey: string;
  environment: MayarEnvironment;
  merchantId: string;
  baseUrl: string;
};

export type CreateMayarPaymentParams = {
  name: string;
  amount: number;
  email: string;
  mobile: string;
  description: string;
  redirectUrl?: string;
  expiredAt: string;
  extraData?: Record<string, unknown>;
};

export type MayarPayment = { id: string; transactionId: string; link: string };
export type MayarTransaction = {
  id: string;
  extraData: Record<string, unknown> | null;
  amount: number;
  status: string;
  expirationDate: number;
  paymentMethod: string | null;
  paymentLink: { id: string; amount: number; status: string; expiredAt: number | null; link: string; type: string };
  user: { id: string; name?: string; email?: string };
};
type MayarEnvelope<T> = { statusCode?: number; messages?: string; message?: string; data?: T };

export class MayarApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly ambiguous: boolean;

  constructor(
    message: string,
    statusCode: number,
    ambiguous: boolean,
    code = String(statusCode || "NETWORK"),
  ) {
    super(message);
    this.name = "MayarApiError";
    this.statusCode = statusCode;
    this.ambiguous = ambiguous;
    this.code = code;
  }

  get retryable(): boolean {
    return this.ambiguous;
  }
}

export function getMayarConfig(): MayarConfig {
  const apiKey = process.env.MAYAR_API_KEY;
  const merchantId = process.env.MAYAR_MERCHANT_ID;
  const rawEnvironment = process.env.MAYAR_ENVIRONMENT;
  if (!apiKey) throw new Error("MAYAR_API_KEY is not configured");
  if (!merchantId) throw new Error("MAYAR_MERCHANT_ID is not configured");
  if (rawEnvironment !== "sandbox" && rawEnvironment !== "production") throw new Error("MAYAR_ENVIRONMENT must be sandbox or production");
  const environment: MayarEnvironment = rawEnvironment === "production" ? "PRODUCTION" : "SANDBOX";
  return { apiKey, merchantId, environment, baseUrl: environment === "PRODUCTION" ? "https://api.mayar.id/hl/v2" : "https://api.mayar.io/hl/v2" };
}

async function mayarFetch<T>(config: MayarConfig, path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: { Accept: "application/json", Authorization: `Bearer ${config.apiKey}`, ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
      signal: init.signal ?? AbortSignal.timeout(15_000),
      cache: "no-store",
    });
  } catch (error) {
    throw new MayarApiError(error instanceof Error ? error.message : "Mayar network error", 0, true);
  }
  let body: MayarEnvelope<T>;
  try { body = await response.json() as MayarEnvelope<T>; }
  catch {
    // A successful/non-definitive HTTP response may already represent a created payment.
    // Without a parseable body we must reconcile, never permit an immediate retry.
    throw new MayarApiError(`Mayar returned invalid JSON (HTTP ${response.status})`, response.status, true, "INVALID_RESPONSE");
  }
  const statusCode = body.statusCode ?? response.status;
  if (!response.ok || statusCode >= 400 || !body.data) {
    throw new MayarApiError(body.messages ?? body.message ?? `Mayar HTTP ${response.status}`, statusCode, statusCode === 0 || statusCode === 429 || statusCode >= 500);
  }
  return body.data;
}

export async function createMayarPayment(config: MayarConfig, params: CreateMayarPaymentParams): Promise<MayarPayment> {
  const data = await mayarFetch<MayarPayment>(config, "/payments/create", { method: "POST", body: JSON.stringify(params) });
  if (!data.id || !data.transactionId || !data.link) throw new MayarApiError("Mayar create response is missing required references", 502, true);
  return data;
}

export async function getMayarTransaction(config: MayarConfig, transactionId: string): Promise<MayarTransaction> {
  return mayarFetch<MayarTransaction>(config, `/transactions/${encodeURIComponent(transactionId)}`, { method: "GET" });
}

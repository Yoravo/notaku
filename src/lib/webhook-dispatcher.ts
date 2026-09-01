import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export type WebhookEvent = "invoice.created" | "invoice.paid" | "invoice.overdue" | "invoice.cancelled";

export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  payload: Record<string, any>
) {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!endpoints.length) return;

    const matchingEndpoints = endpoints.filter(
      (ep) => ep.events.includes(event) || ep.events.includes("*")
    );

    if (!matchingEndpoints.length) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const bodyString = JSON.stringify({
      id: `evt_${crypto.randomBytes(12).toString("hex")}`,
      event,
      createdAt: new Date().toISOString(),
      data: payload,
    });

    // Dispatch concurrently with timeout
    await Promise.allSettled(
      matchingEndpoints.map(async (endpoint) => {
        const startTime = Date.now();
        let statusCode: number | null = null;
        let responseText: string | null = null;
        let success = false;

        try {
          // Signature: HMAC-SHA256 of `${timestamp}.${bodyString}` using endpoint.secret
          const hmac = crypto
            .createHmac("sha256", endpoint.secret)
            .update(`${timestamp}.${bodyString}`)
            .digest("hex");

          const signatureHeader = `t=${timestamp},v1=${hmac}`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

          const res = await fetch(endpoint.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "NotaKu-Webhook/1.0",
              "x-notaku-event": event,
              "x-notaku-signature": signatureHeader,
            },
            body: bodyString,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          statusCode = res.status;
          responseText = await res.text().catch(() => null);
          if (responseText && responseText.length > 500) {
            responseText = responseText.slice(0, 500) + "... (truncated)";
          }
          success = res.ok;
        } catch (err: any) {
          responseText = err?.message || "Connection failed or timed out";
          success = false;
        } finally {
          const durationMs = Date.now() - startTime;

          // Save webhook log asynchronously
          await prisma.webhookLog
            .create({
              data: {
                endpointId: endpoint.id,
                event,
                payload: payload as any,
                statusCode,
                response: responseText,
                durationMs,
                success,
              },
            })
            .catch((logErr) => console.error("Failed to write webhook log:", logErr));
        }
      })
    );
  } catch (err) {
    console.error("Webhook dispatch error:", err);
  }
}

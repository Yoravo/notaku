import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requestSafeWebhook } from "@/lib/safe-webhook";

export type WebhookEvent = "invoice.created" | "invoice.paid" | "invoice.overdue" | "invoice.cancelled";

type DispatchOptions = {
  throwOnFailure?: boolean;
  eventId?: string;
};

/**
 * Delivers webhooks with an at-least-once external guarantee. A receiver can
 * observe a duplicate after an ambiguous network failure and must deduplicate
 * by the stable event ID; exactly-once delivery is not promised.
 */
export async function dispatchWebhook(
  userId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>,
  options: DispatchOptions = {},
): Promise<void> {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { userId, isActive: true },
    });
    const matchingEndpoints = endpoints.filter(
      (endpoint) => endpoint.events.includes(event) || endpoint.events.includes("*"),
    );
    if (!matchingEndpoints.length) return;

    const eventId = options.eventId ?? `evt_${crypto.randomBytes(12).toString("hex")}`;
    let pendingEndpoints = matchingEndpoints;
    if (options.eventId) {
      const completed = await prisma.webhookLog.findMany({
        where: {
          eventId,
          endpointId: { in: matchingEndpoints.map((endpoint) => endpoint.id) },
          success: true,
        },
        select: { endpointId: true },
      });
      const completedIds = new Set(completed.map((delivery) => delivery.endpointId));
      pendingEndpoints = matchingEndpoints.filter((endpoint) => !completedIds.has(endpoint.id));
    }
    if (!pendingEndpoints.length) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const bodyString = JSON.stringify({
      id: eventId,
      event,
      createdAt: new Date().toISOString(),
      data: payload,
    });

    const results = await Promise.allSettled(pendingEndpoints.map(async (endpoint) => {
      const startTime = Date.now();
      let statusCode: number | null = null;
      let responseText: string | null = null;
      let success = false;
      let deliveryError: unknown;

      try {
        const signature = crypto
          .createHmac("sha256", endpoint.secret)
          .update(`${timestamp}.${bodyString}`)
          .digest("hex");
        const response = await requestSafeWebhook(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyString).toString(),
            "User-Agent": "NotaKu-Webhook/1.0",
            "x-notaku-event": event,
            "x-notaku-signature": `t=${timestamp},v1=${signature}`,
          },
          body: bodyString,
        });
        statusCode = response.status;
        responseText = response.body || null;
        success = statusCode >= 200 && statusCode < 300;
        if (!success) deliveryError = new Error(`Webhook HTTP ${statusCode}`);
      } catch (error) {
        deliveryError = error;
        responseText = error instanceof Error ? error.message : "Connection failed or timed out";
      }

      const logData = {
        event,
        payload: payload as never,
        statusCode,
        response: responseText,
        durationMs: Date.now() - startTime,
        success,
      };
      try {
        if (options.eventId) {
          await prisma.webhookLog.upsert({
            where: { endpointId_eventId: { endpointId: endpoint.id, eventId } },
            create: { endpointId: endpoint.id, eventId, ...logData },
            update: logData,
          });
        } else {
          await prisma.webhookLog.create({
            data: { endpointId: endpoint.id, eventId, ...logData },
          });
        }
      } catch (logError) {
        console.error("Failed to write webhook log:", logError);
        if (options.eventId && !deliveryError) deliveryError = logError;
      }

      if (deliveryError) throw deliveryError;
    }));

    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
    if (failures.length && options.throwOnFailure) {
      throw new AggregateError(failures.map((failure) => failure.reason), `${failures.length} webhook delivery failure(s)`);
    }
  } catch (error) {
    console.error("Webhook dispatch error:", error);
    if (options.throwOnFailure) throw error;
  }
}

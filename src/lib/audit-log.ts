import { prisma } from "./prisma";

type AuditDetail = Record<string, unknown>;

export async function auditLog(
  event: string,
  detail: AuditDetail,
  options?: { userId?: string; ipAddress?: string },
) {
  try {
    await prisma.auditLog.create({
      data: {
        event,
        detail: detail as object,
        userId: options?.userId || null,
        ipAddress: options?.ipAddress || null,
      },
    });
  } catch {
    // Jangan sampai audit log nge-break app
    console.error("[AUDIT_LOG_FAILED]", event, detail);
  }
}

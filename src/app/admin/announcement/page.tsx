import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { MegaphoneIcon } from "@heroicons/react/24/outline";
import { AnnouncementForm } from "./announcement-form";
import type { AnnouncementPlacement } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementPage() {
  await requireAdmin();

  // Fetch current announcement from audit log
  const latestAnnouncementLog = await prisma.auditLog.findFirst({
    where: { event: "system.announcement" },
    orderBy: { createdAt: "desc" },
  });

  const detail = latestAnnouncementLog?.detail as any;

  const currentData = detail
    ? {
        message: detail.message || "",
        type: (detail.type || "info") as "info" | "warning" | "success",
        placement: (detail.placement || "ALL") as AnnouncementPlacement,
        isActive: Boolean(detail.isActive),
        linkText: detail.linkText || "",
        linkUrl: detail.linkUrl || "",
        updatedBy: detail.updatedBy || null,
        updatedAt: detail.updatedAt || null,
      }
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <MegaphoneIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f]" />
          <span>Siaran Pengumuman & Promo (Broadcast)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tampilkan banner pengumuman, promo diskon, update sistem, atau info penting di Landing Page dan Dashboard pengguna.
        </p>
      </div>

      <AnnouncementForm initialData={currentData} />
    </div>
  );
}

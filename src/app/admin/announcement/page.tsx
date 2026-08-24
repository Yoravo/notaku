import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { MegaphoneIcon } from "@heroicons/react/24/outline";
import { AnnouncementForm } from "./announcement-form";

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
        type: detail.type || "info",
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <MegaphoneIcon className="w-8 h-8 text-emerald-600" />
          Siaran Pengumuman Dashboard (Broadcast)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Tampilkan banner pengumuman, update sistem, promo, atau info penting di bagian atas dashboard seluruh pengguna.
        </p>
      </div>

      <AnnouncementForm initialData={currentData} />
    </div>
  );
}

import { requireAdmin } from "@/lib/admin";
import { getBroadcastAudienceEstimate, getBroadcastHistory } from "@/actions/broadcast";
import { BroadcastClient } from "./broadcast-client";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastPage() {
  await requireAdmin();

  const [allEstimate, proEstimate, freeEstimate, history] = await Promise.all([
    getBroadcastAudienceEstimate("ALL", true),
    getBroadcastAudienceEstimate("PRO_ONLY", true),
    getBroadcastAudienceEstimate("FREE_ONLY", true),
    getBroadcastHistory(),
  ]);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <EnvelopeIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#0f6b4f]" />
          <span>Email Broadcast & Pengumuman Resmi</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kirimkan email siaran pengumuman fitur baru, promo diskon, atau info penting secara resmi ke seluruh pengguna terdaftar via Resend.
        </p>
      </div>

      <BroadcastClient
        estimates={{
          all: allEstimate.count,
          pro: proEstimate.count,
          free: freeEstimate.count,
        }}
        history={history}
      />
    </div>
  );
}

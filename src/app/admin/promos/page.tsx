import { requireAdmin } from "@/lib/admin";
import { getPromoCodes } from "@/actions/admin";
import { TagIcon } from "@heroicons/react/24/outline";
import { PromoManager } from "./promo-manager";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  await requireAdmin();
  const promos = await getPromoCodes();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-900 text-white">
          <TagIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
            Manajemen Kode Voucher & Promo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Buat dan kelola kupon diskon untuk langganan paket Pro pengguna NotaKu.
          </p>
        </div>
      </div>

      {/* Main Promo Component */}
      <PromoManager initialPromos={promos} />
    </div>
  );
}

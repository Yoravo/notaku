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
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-2xs">
          <TagIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Kode Voucher & Promo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Buat dan kelola kupon diskon untuk langganan paket Pro pengguna NotaKu via Mayar Checkout.
          </p>
        </div>
      </div>

      {/* Main Promo Component */}
      <PromoManager initialPromos={promos} />
    </div>
  );
}

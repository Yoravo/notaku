import { requireAdmin } from "@/lib/admin";
import { getPromoCodes } from "@/actions/admin";
import { TagIcon } from "@heroicons/react/24/outline";
import { PromoManager } from "./promo-manager";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  await requireAdmin();
  const [promos, tAdmin] = await Promise.all([
    getPromoCodes(),
    getTranslations("admin"),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xs border border-slate-800 dark:border-slate-700">
          <TagIcon className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tAdmin("promoTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {tAdmin("promoSubtitle")}
          </p>
        </div>
      </div>

      {/* Main Promo Component */}
      <PromoManager initialPromos={promos} />
    </div>
  );
}

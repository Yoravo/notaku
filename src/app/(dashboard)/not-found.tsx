import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t("desc")}
      </p>
      <Link
        href="/dashboard"
        prefetch={true}
        className="mt-4 rounded-xl bg-[#0f6b4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c5740] transition-colors shadow-xs"
      >
        {t("backToDashboard")}
      </Link>
    </div>
  );
}

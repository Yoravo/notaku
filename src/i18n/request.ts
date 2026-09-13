import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const locales = ["id", "en"] as const;
export type AppLocale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Locale resolution order:
  // 1. Cookie NEXT_LOCALE
  // 2. Accept-Language header
  // 3. Fallback default: "id"
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("NEXT_LOCALE")?.value as AppLocale | undefined;

  let locale: AppLocale = "id";

  if (savedLocale && locales.includes(savedLocale)) {
    locale = savedLocale;
  } else {
    const reqHeaders = await headers();
    const acceptLang = reqHeaders.get("accept-language") || "";
    if (acceptLang.toLowerCase().includes("en") && !acceptLang.toLowerCase().startsWith("id")) {
      locale = "en";
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

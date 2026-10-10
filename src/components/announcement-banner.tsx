import Link from "next/link";
import { MegaphoneIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export interface AnnouncementData {
  message: string;
  type: "info" | "warning" | "success";
  placement?: string;
  linkText?: string | null;
  linkUrl?: string | null;
}

export function AnnouncementBanner({
  announcement,
}: {
  announcement: AnnouncementData | null;
}) {
  if (!announcement) {
    return null;
  }

  const colorStyles = {
    info: "bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/50 dark:border-sky-900 dark:text-sky-200",
    warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-200",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-200",
  }[announcement.type];

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${colorStyles}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <MegaphoneIcon className="w-5 h-5 shrink-0 opacity-80" />
        <p className="text-xs sm:text-sm font-medium leading-relaxed">
          {announcement.message}
        </p>
      </div>

      {announcement.linkText && announcement.linkUrl && (
        <div className="shrink-0 self-end sm:self-auto">
          {announcement.linkUrl.startsWith("http") ? (
            <a
              href={announcement.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-xs font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {announcement.linkText}
              <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          ) : (
            <Link
              href={announcement.linkUrl}
              className="inline-flex min-h-11 items-center gap-1 text-xs font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {announcement.linkText}
              <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { MegaphoneIcon } from "@heroicons/react/24/outline";

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
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
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
              className="text-xs font-bold underline hover:opacity-80 transition-opacity"
            >
              {announcement.linkText} →
            </a>
          ) : (
            <Link
              href={announcement.linkUrl}
              className="text-xs font-bold underline hover:opacity-80 transition-opacity"
            >
              {announcement.linkText} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

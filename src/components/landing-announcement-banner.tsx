import { getActiveAnnouncement } from "@/actions/admin";
import Link from "next/link";
import { MegaphoneIcon, SparklesIcon } from "@heroicons/react/24/outline";

export async function LandingAnnouncementBanner() {
  const announcement = await getActiveAnnouncement("LANDING");

  if (!announcement) {
    return null;
  }

  const colorStyles = {
    info: "bg-blue-600 text-white border-blue-700",
    warning: "bg-amber-600 text-white border-amber-700",
    success: "bg-emerald text-paper border-emerald-900",
  }[announcement.type];

  return (
    <div
      className={`relative z-50 w-full py-2.5 px-4 text-xs font-semibold border-b shadow-xs transition-all ${colorStyles}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
            <SparklesIcon className="h-3.5 w-3.5" />
          </span>
          <p className="truncate text-xs leading-relaxed font-medium text-white/95">
            {announcement.message}
          </p>
        </div>

        {announcement.linkText && announcement.linkUrl && (
          <div className="shrink-0">
            {announcement.linkUrl.startsWith("http") ? (
              <a
                href={announcement.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/30 transition-colors"
              >
                <span>{announcement.linkText}</span>
                <span>→</span>
              </a>
            ) : (
              <Link
                href={announcement.linkUrl}
                className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/30 transition-colors"
              >
                <span>{announcement.linkText}</span>
                <span>→</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

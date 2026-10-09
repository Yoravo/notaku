export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-72 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="mt-3 h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-3 w-36 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Table / Content Block Skeleton */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-48 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="space-y-3 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800/60 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
              <div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

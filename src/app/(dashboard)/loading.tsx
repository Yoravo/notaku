export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-64 rounded bg-slate-100 dark:bg-slate-800/60" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="mt-3 h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-3 w-36 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        ))}
      </div>

      <div className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-2xs" />
    </div>
  );
}

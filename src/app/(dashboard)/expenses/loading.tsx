export default function ExpensesLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-5 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-72 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
        <div className="h-11 w-full sm:w-40 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Summary skeleton */}
      <div className="h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />

      {/* Toolbar skeleton */}
      <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />

      {/* Table skeleton */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        ))}
      </div>
    </div>
  );
}

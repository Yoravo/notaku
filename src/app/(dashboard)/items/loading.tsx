export default function ItemsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-5 w-52 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-72 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>
        <div className="h-11 w-full sm:w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Search skeleton */}
      <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3"
          >
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
            <div className="h-6 w-1/3 rounded bg-slate-200 dark:bg-slate-800 mt-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

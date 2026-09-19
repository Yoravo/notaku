export default function ChangelogLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col animate-pulse">
      {/* Skeleton Navbar placeholder */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60" />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Skeleton Back button */}
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mb-8" />

        {/* Skeleton Header */}
        <div className="space-y-3 mb-12">
          <div className="h-6 w-28 bg-emerald-100 dark:bg-emerald-950 rounded-full" />
          <div className="h-9 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-full max-w-md bg-slate-100 dark:bg-slate-800/60 rounded-md" />
        </div>

        {/* Skeleton Timeline Cards */}
        <div className="space-y-8 ml-3 pl-6 border-l-2 border-slate-200 dark:border-slate-800">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded-md" />
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="h-3.5 w-5/6 bg-slate-100 dark:bg-slate-800/40 rounded-md" />
                <div className="h-3.5 w-4/6 bg-slate-100 dark:bg-slate-800/40 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

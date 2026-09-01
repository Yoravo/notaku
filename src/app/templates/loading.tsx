export default function Loading() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header skeleton */}
      <div className="h-20 border-b border-line bg-paper px-6 flex items-center justify-between">
        <div className="h-8 w-28 bg-ink/10 rounded-xl animate-pulse" />
        <div className="hidden md:flex gap-6">
          <div className="h-4 w-16 bg-ink/10 rounded animate-pulse" />
          <div className="h-4 w-16 bg-ink/10 rounded animate-pulse" />
        </div>
        <div className="h-9 w-24 bg-emerald/20 rounded-full animate-pulse" />
      </div>

      {/* Hero skeleton */}
      <div className="border-b border-line bg-paper-deep/40 py-12 text-center px-4 animate-pulse">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="h-5 w-44 bg-emerald/20 rounded-full mx-auto" />
          <div className="h-9 w-3/4 bg-ink/10 rounded-2xl mx-auto" />
          <div className="h-4 w-full bg-ink/5 rounded mx-auto" />
          <div className="h-11 w-full max-w-md bg-white rounded-2xl border border-line mx-auto mt-6" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-line bg-white space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 rounded bg-paper-deep" />
                <div className="h-4 w-20 rounded bg-emerald/10" />
              </div>
              <div className="h-6 w-4/5 bg-ink/10 rounded" />
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-ink/5 rounded" />
                <div className="h-3.5 w-4/5 bg-ink/5 rounded" />
              </div>
              <div className="h-14 bg-paper-deep/60 rounded-xl" />
              <div className="pt-4 border-t border-line/60 flex justify-between">
                <div className="h-4 w-28 bg-ink/10 rounded" />
                <div className="h-7 w-20 bg-emerald/10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

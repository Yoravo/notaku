export default function Loading() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header skeleton */}
      <div className="h-20 border-b border-line bg-paper px-6 flex items-center justify-between">
        <div className="h-8 w-28 bg-ink/10 rounded-xl animate-pulse" />
        <div className="hidden md:flex gap-6">
          <div className="h-4 w-16 bg-ink/10 rounded animate-pulse" />
          <div className="h-4 w-16 bg-ink/10 rounded animate-pulse" />
          <div className="h-4 w-16 bg-ink/10 rounded animate-pulse" />
        </div>
        <div className="h-9 w-24 bg-emerald/20 rounded-full animate-pulse" />
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="h-5 w-48 bg-emerald/20 rounded-full mx-auto" />
          <div className="h-10 w-3/4 bg-ink/10 rounded-2xl mx-auto" />
          <div className="h-4 w-full bg-ink/5 rounded mx-auto" />
        </div>

        {/* Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-surface border border-border-light space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald/10" />
                <div className="w-16 h-5 rounded-full bg-ink/5" />
              </div>
              <div className="h-5 w-3/4 bg-ink/10 rounded" />
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-ink/5 rounded" />
                <div className="h-3.5 w-5/6 bg-ink/5 rounded" />
              </div>
              <div className="pt-4 border-t border-border-light flex justify-between items-center">
                <div className="h-4 w-28 bg-emerald/20 rounded" />
                <div className="h-4 w-4 bg-emerald/20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

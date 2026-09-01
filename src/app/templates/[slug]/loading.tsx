export default function Loading() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header skeleton */}
      <div className="h-20 border-b border-line bg-paper px-6 flex items-center justify-between">
        <div className="h-8 w-28 bg-ink/10 rounded-xl animate-pulse" />
        <div className="h-9 w-24 bg-emerald/20 rounded-full animate-pulse" />
      </div>

      {/* Detail Page Skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-ink/10 rounded" />
          <div className="h-10 w-2/3 bg-ink/10 rounded-2xl" />
          <div className="h-4 w-full max-w-xl bg-ink/5 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-line space-y-4">
            <div className="h-48 bg-paper-deep/60 rounded-2xl" />
            <div className="h-4 w-3/4 bg-ink/10 rounded" />
            <div className="h-4 w-1/2 bg-ink/10 rounded" />
          </div>
          <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-line space-y-4">
            <div className="h-6 w-3/4 bg-ink/10 rounded" />
            <div className="h-12 w-full bg-emerald/20 rounded-2xl" />
            <div className="h-20 bg-paper-deep/60 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="h-20 border-b border-line bg-paper px-6 flex items-center justify-between">
        <div className="h-8 w-28 bg-ink/10 rounded-xl animate-pulse" />
        <div className="h-9 w-24 bg-emerald/20 rounded-full animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-5 w-36 bg-emerald/20 rounded-full" />
          <div className="h-8 w-1/2 bg-ink/10 rounded-xl" />
          <div className="h-4 w-2/3 bg-ink/5 rounded" />
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-light space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-paper-deep rounded-xl" />
            <div className="h-10 bg-paper-deep rounded-xl" />
          </div>
          <div className="h-36 bg-paper-deep/70 rounded-2xl" />
          <div className="h-12 bg-emerald/20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

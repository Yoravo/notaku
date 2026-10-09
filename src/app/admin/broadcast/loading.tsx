export default function AdminBroadcastLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs h-96" />
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs h-96" />
      </div>
    </div>
  );
}
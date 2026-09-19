export default function OfflineLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 animate-pulse text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-5" />
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto mb-3" />
        <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/60 rounded-md mx-auto mb-6" />
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </main>
  );
}

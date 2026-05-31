"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold text-gray-900">Terjadi kesalahan</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        {error.message || "Maaf, ada yang tidak beres. Coba lagi."}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white cursor-pointer
  hover:bg-blue-700 transition-colors"
      >
        Coba lagi
      </button>
    </div>
  );
}

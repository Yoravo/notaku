"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">Terjadi kesalahan</h2>
        <p className="mt-2 text-sm text-gray-500">
          Maaf, ada yang tidak beres.
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white cursor-pointer
  hover:bg-blue-700"
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}

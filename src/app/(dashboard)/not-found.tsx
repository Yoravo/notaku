import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-lg font-semibold text-gray-900">
        Halaman tidak ditemukan
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Halaman yang kamu cari tidak ada.
      </p>
      <Link
        href="/dashboard"
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700
  transition-colors"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

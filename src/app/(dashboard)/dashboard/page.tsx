import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Selamat datang kembali, {session.user.name}.
      </p>

      {/* Placeholder cards — will be replaced in Phase 2 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Invoice Bulan Ini</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Pelanggan</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Plan</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">Free</p>
        </div>
      </div>
    </div>
  );
}

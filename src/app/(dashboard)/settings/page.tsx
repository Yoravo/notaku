import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UpgradeButton } from "@/components/upgrade-button";
import { TemplateSelector } from "@/components/template-selector";
import { PaymentVerifier } from "@/components/payment-verifier";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isPro = user.plan === "PRO";
  const subscription = user.subscription;

  return (
    <div className="max-w-2xl">
      <PaymentVerifier />
      <h1 className="text-xl font-semibold text-gray-900">Pengaturan</h1>

      {/* Profile */}
      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Profil
        </h2>
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="text-gray-500">Nama:</span>{" "}
            <span className="text-gray-900">{user.name}</span>
          </p>
          <p>
            <span className="text-gray-500">Email:</span>{" "}
            <span className="text-gray-900">{user.email}</span>
          </p>
          {user.businessName && (
            <p>
              <span className="text-gray-500">Bisnis:</span>{" "}
              <span className="text-gray-900">{user.businessName}</span>
            </p>
          )}
        </div>
      </section>

      {/* Subscription */}
      <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Langganan
        </h2>

        <div className="mt-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isPro ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {isPro ? "Pro" : "Free"}
            </span>
            {isPro && subscription?.currentPeriodEnd && (
              <span className="text-sm text-gray-500">
                Berlaku hingga{" "}
                {subscription.currentPeriodEnd.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          {isPro ? (
            <div className="mt-3 text-sm text-gray-600">
              <p>
                Kamu sedang menggunakan plan Pro. Nikmati invoice unlimited dan
                fitur premium.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                Plan gratis: 5 invoice/bulan dengan watermark NotaKu.
              </p>
              <div className="mt-3">
                <UpgradeButton />
              </div>
            </div>
          )}
        </div>
      </section>
      {isPro && (
        <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Template Invoice
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Pilih tampilan PDF invoice kamu
          </p>
          <TemplateSelector current={user.invoiceTemplate} />
        </section>
      )}
    </div>
  );
}

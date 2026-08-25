"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/profile-form";
import { SecurityForm } from "@/components/security-form";
import { TemplateSelector } from "@/components/template-selector";
import { UpgradeButton } from "@/components/upgrade-button";
import { InvoiceTemplate } from "@/generated/prisma/client";
import { formatDateWIB } from "@/lib/invoice-utils";
import {
  UserIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

type UserData = {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
  plan: string;
  invoiceTemplate: InvoiceTemplate;
  subscription: {
    currentPeriodEnd: Date | null;
    status: string;
  } | null;
};

export function SettingsTabsClient({ user }: { user: UserData }) {
  const [activeTab, setActiveTab] = useState<"profile" | "template" | "security" | "plan">("profile");

  const isPro = user.plan === "PRO";

  const tabs = [
    { id: "profile", label: "Profil & Bisnis", icon: UserIcon },
    { id: "template", label: "Preferensi Invoice", icon: DocumentTextIcon },
    { id: "security", label: "Keamanan Akun", icon: ShieldCheckIcon },
    { id: "plan", label: "Paket & Kuota", icon: SparklesIcon },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation (Responsive Scroll on Mobile) */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl px-2 sm:px-4">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0f6b4f]/10 text-[#0f6b4f] border border-[#0f6b4f]/20 font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0f6b4f]" : "text-gray-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Container */}
      <div className="bg-white rounded-b-xl rounded-t-none sm:rounded-xl border border-gray-200 p-5 sm:p-7 shadow-xs">
        {/* Tab 1: Profile & Business */}
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Profil & Identitas Bisnis
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Kelola informasi nama toko, nomor kontak, dan logo yang akan dicetak pada setiap invoice Anda.
              </p>
            </div>

            <ProfileForm
              name={user.name}
              businessName={user.businessName}
              phone={user.phone}
              address={user.address}
              logoUrl={user.logoUrl}
              signatureUrl={user.signatureUrl}
              stampUrl={user.stampUrl}
              email={user.email}
            />
          </div>
        )}

        {/* Tab 2: Invoice Preferences & Template */}
        {activeTab === "template" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Template & Desain PDF Invoice
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Pilih gaya tata letak PDF invoice default Anda (Classic, Modern, atau Minimal).
              </p>
            </div>

            {isPro ? (
              <TemplateSelector current={user.invoiceTemplate} />
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <SparklesIcon className="w-5 h-5 text-amber-600" />
                  Kustomisasi Template adalah Fitur PRO
                </div>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                  Pengguna paket gratis menggunakan template standar <strong>Classic</strong> dengan watermark NotaKu.
                  Upgrade ke Pro untuk memilih template Modern/Minimal, hapus watermark, dan simpan invoice tanpa batas.
                </p>
                <div className="pt-2">
                  <UpgradeButton />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Keamanan & Kata Sandi Akun
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Pastikan akun Anda terlindungi dengan menggunakan kombinasi kata sandi yang kuat.
              </p>
            </div>

            <SecurityForm />
          </div>
        )}

        {/* Tab 4: Plan & Subscription */}
        {activeTab === "plan" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Paket Langganan & Batasan Kuota
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Informasi status paket akun NotaKu Anda saat ini.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5 bg-gray-50/70 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                    Paket Saat Ini
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        isPro
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isPro && <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />}
                      {user.plan} PLAN
                    </span>
                  </div>
                </div>

                {isPro && user.subscription?.currentPeriodEnd && (
                  <div className="text-right text-xs text-gray-500">
                    <p>Aktif Hingga:</p>
                    <p className="font-bold text-gray-800 font-mono">
                      {formatDateWIB(user.subscription.currentPeriodEnd, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-3 text-xs sm:text-sm text-gray-600">
                {isPro ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckBadgeIcon className="w-4 h-4" />
                      Invoice Bulanan Unlimited & Tanpa Watermark
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckBadgeIcon className="w-4 h-4" />
                      Maksimal Pelanggan & Item Tidak Terbatas
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckBadgeIcon className="w-4 h-4" />
                      Akses Seluruh Template PDF Premium
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p>
                      Akun Free dibatasi <strong>5 invoice per bulan</strong> dan <strong>maks 20 customer</strong> dengan watermark NotaKu.
                    </p>
                    <div className="pt-1">
                      <UpgradeButton />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/profile-form";
import { BankSettingsForm } from "@/components/bank-settings-form";
import { SecurityForm } from "@/components/security-form";
import { TemplateSelector } from "@/components/template-selector";
import { UpgradeButton } from "@/components/upgrade-button";
import { InvoiceTemplate } from "@/generated/prisma/client";
import {
  UserIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  SparklesIcon,
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
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  bankAccountLocked?: boolean;
  plan: string;
  invoiceTemplate: InvoiceTemplate;
};

export function SettingsTabsClient({ user }: { user: UserData }) {
  const [activeTab, setActiveTab] = useState<"profile" | "bank" | "template" | "security">("profile");

  const isPro = user.plan === "PRO";

  const tabs = [
    { id: "profile", label: "Profil & Identitas", icon: UserIcon },
    { id: "bank", label: "Rekening Pembayaran", icon: BuildingLibraryIcon },
    { id: "template", label: "Desain PDF Faktur", icon: DocumentTextIcon },
    { id: "security", label: "Keamanan Akun", icon: ShieldCheckIcon },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
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
                Profil & Identitas Usaha
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Kelola informasi nama usaha, kontak, alamat, logo, dan tanda tangan resmi pada invoice.
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

        {/* Tab 2: Rekening Bank & E-Wallet */}
        {activeTab === "bank" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Rekening Bank & E-Wallet
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Nomor rekening tujuan transfer invoice manual pelanggan dan tujuan pencairan saldo (payout).
              </p>
            </div>

            <BankSettingsForm
              bankName={user.bankName || null}
              bankAccountNumber={user.bankAccountNumber || null}
              bankAccountName={user.bankAccountName || null}
              isLocked={Boolean(user.bankAccountLocked)}
              userFullName={user.name}
            />
          </div>
        )}

        {/* Tab 3: Template & Desain Invoice */}
        {activeTab === "template" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Pilihan Template PDF Invoice
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Atur gaya tata letak default PDF invoice Anda (Classic, Modern, atau Minimal).
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
                  Pengguna paket gratis menggunakan template standar <strong>Classic</strong>.
                  Upgrade ke Pro untuk memilih template Modern/Minimal, hapus watermark, dan simpan invoice tanpa batas.
                </p>
                <div className="pt-2">
                  <UpgradeButton />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Keamanan & Password */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Keamanan & Kata Sandi Akun
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Pastikan akun Anda terlindungi dengan kata sandi yang kuat dan aman.
              </p>
            </div>

            <SecurityForm />
          </div>
        )}
      </div>
    </div>
  );
}

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
import { useLanguage } from "@/lib/i18n/context";

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
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"profile" | "bank" | "template" | "security">("profile");

  const isPro = user.plan === "PRO";

  const tabs = [
    { id: "profile", label: t.settings?.tabProfile || (locale === "id" ? "Profil & Identitas" : "Profile & Identity"), icon: UserIcon },
    { id: "bank", label: t.settings?.tabBank || (locale === "id" ? "Rekening Pembayaran" : "Bank Account"), icon: BuildingLibraryIcon },
    { id: "template", label: locale === "id" ? "Desain PDF Faktur" : "Invoice PDF Template", icon: DocumentTextIcon },
    { id: "security", label: t.settings?.tabSecurity || (locale === "id" ? "Keamanan Akun" : "Account Security"), icon: ShieldCheckIcon },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Page Header (Reactive Translation) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {t.settings?.title || (locale === "id" ? "Pengaturan Akun & Bisnis" : "Account & Business Settings")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.settings?.subtitle ||
            (locale === "id"
              ? "Kelola profil usaha, logo & tanda tangan faktur, rekening pembayaran, preferensi template PDF, dan keamanan akun."
              : "Configure business branding, payment details, PDF templates, and account security.")}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0f6b4f]/10 text-[#0f6b4f] border border-[#0f6b4f]/20 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0f6b4f]" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-2xs">
        {/* Tab 1: Profile & Business */}
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {locale === "id" ? "Profil & Identitas Usaha" : "Business Profile & Identity"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {locale === "id"
                  ? "Kelola informasi nama usaha, kontak, alamat, logo, tanda tangan, dan stempel resmi pada invoice."
                  : "Manage business name, contact, address, logo, digital signature, and official invoice stamp."}
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
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {locale === "id" ? "Rekening Bank & E-Wallet" : "Bank Account & E-Wallet"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {locale === "id"
                  ? "Nomor rekening tujuan transfer invoice manual pelanggan dan tujuan pencairan saldo (payout)."
                  : "Destination bank account for manual client transfers and wallet payouts."}
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
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {locale === "id" ? "Pilihan Template PDF Invoice" : "Invoice PDF Template Options"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {locale === "id"
                  ? "Atur gaya tata letak default PDF invoice Anda (Classic, Modern, atau Minimal)."
                  : "Choose default PDF layout style for your invoices (Classic, Modern, or Minimal)."}
              </p>
            </div>

            {isPro ? (
              <TemplateSelector current={user.invoiceTemplate} />
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <SparklesIcon className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{locale === "id" ? "Kustomisasi Template adalah Fitur PRO" : "Template Customization is a PRO Feature"}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {locale === "id"
                    ? "Upgrade ke akun NotaKu PRO untuk membuka akses bebas memilih 3 template faktur eksklusif (Classic, Modern, Minimal) dan menghapus watermark NotaKu pada dokumen PDF."
                    : "Upgrade to NotaKu PRO to unlock access to 3 exclusive invoice layout templates (Classic, Modern, Minimal) and remove the NotaKu watermark on all PDF exports."}
                </p>
                <div className="pt-2">
                  <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c5740] transition-colors cursor-pointer" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Keamanan & Password */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {t.settings?.tabSecurity || (locale === "id" ? "Keamanan Akun" : "Account Security")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {locale === "id"
                  ? "Perbarui kata sandi akun NotaKu Anda untuk menjaga keamanan akses dan data tagihan."
                  : "Update your NotaKu account password to safeguard access and invoice data."}
              </p>
            </div>

            <SecurityForm />
          </div>
        )}
      </div>
    </div>
  );
}

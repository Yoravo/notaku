"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/profile-form";
import { BankSettingsForm } from "@/components/bank-settings-form";
import { SecurityForm } from "@/components/security-form";
import { TemplateSelector } from "@/components/template-selector";
import { CustomDomainForm } from "@/components/custom-domain-form";
import { DeveloperSettingsForm } from "@/components/developer-settings-form";
import { NotificationSettingsForm } from "@/components/notification-settings-form";
import { UpgradeButton } from "@/components/upgrade-button";
import { InvoiceTemplate } from "@/generated/prisma/client";
import {
  UserIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import type { CustomDomainData } from "@/actions/domains";
import type { ApiKeyData, WebhookEndpointData } from "@/actions/developer";
import type { BotNotificationSettings } from "@/actions/notifications";

export type SettingsTab = "profile" | "bank" | "template" | "domain" | "developer" | "notifications" | "security";

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
  receiveNewsletter?: boolean;
  plan: string;
  invoiceTemplate: InvoiceTemplate;
  invoiceColor?: string | null;
  invoiceFont?: string | null;
};

export function SettingsTabsClient({
  user,
  domainData,
  developerData,
  botNotificationData,
  initialTab = "profile",
}: {
  initialTab?: SettingsTab;
  user: UserData;
  domainData: CustomDomainData;
  developerData: {
    isPro: boolean;
    apiKeys: ApiKeyData[];
    webhooks: WebhookEndpointData[];
  };
  botNotificationData: BotNotificationSettings;
}) {
  const tSet = useTranslations("settings");
  const tTmpl = useTranslations("templates");
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Mirror hasProFeatures/hasBusinessFeatures (Rule #50). plan-limits.ts mengimpor prisma, jadi tidak boleh masuk client bundle.
  const isPro = user.plan === "PRO" || user.plan === "BUSINESS";
  const isBusiness = user.plan === "BUSINESS";

  // Tab dikelompokkan per tujuan agar semua menu terlihat sekaligus (tanpa scroll horizontal).
  const groups: {
    title: string;
    tabs: { id: SettingsTab; label: string; icon: typeof UserIcon; badge?: string }[];
  }[] = [
    {
      title: tSet("groupAccount"),
      tabs: [
        { id: "profile", label: tSet("tabProfile"), icon: UserIcon },
        { id: "security", label: tSet("tabSecurity"), icon: ShieldCheckIcon },
      ],
    },
    {
      title: tSet("groupInvoice"),
      tabs: [
        { id: "bank", label: tSet("tabBank"), icon: BuildingLibraryIcon },
        { id: "template", label: tSet("tabTemplate"), icon: DocumentTextIcon, badge: isPro ? undefined : "PRO" },
      ],
    },
    {
      title: tSet("groupIntegrations"),
      tabs: [
        { id: "domain", label: tSet("tabDomain"), icon: GlobeAltIcon, badge: isBusiness ? undefined : "BIZ" },
        { id: "developer", label: tSet("tabDeveloper"), icon: CodeBracketIcon, badge: isBusiness ? undefined : "BIZ" },
        { id: "notifications", label: tSet("tabNotifications"), icon: BellAlertIcon, badge: isBusiness ? undefined : "BIZ" },
      ],
    },
  ];

  const selectTab = (id: SettingsTab) => {
    setActiveTab(id);
    // Sinkron ke URL tanpa navigasi server agar tab bisa di-bookmark / di-refresh.
    window.history.replaceState(null, "", `/settings?tab=${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Reactive Translation) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tSet("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tSet("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6 items-start">
      {/* Settings Navigation: grid 2 kolom di mobile, daftar vertikal sticky di desktop */}
      <nav
        aria-label={tSet("title")}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-2xs space-y-4 lg:sticky lg:top-20"
      >
        {groups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.title}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
              {group.tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => selectTab(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2 px-3 py-2 text-left text-xs sm:text-sm rounded-xl transition-colors cursor-pointer min-h-[44px] ${
                      isActive
                        ? "bg-[#0f6b4f]/10 dark:bg-emerald-500/15 text-[#0f6b4f] dark:text-emerald-400 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    }`}
                  >
                    <tab.icon aria-hidden="true" className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0f6b4f] dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                    <span className="min-w-0 flex-1 leading-tight">{tab.label}</span>
                    {tab.badge && (
                      <span className="shrink-0 rounded-md border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-500 dark:text-slate-400">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Tab Content Container */}
      <div className="min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xs">
        {/* Tab 1: Profile & Business */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <ProfileForm
              name={user.name}
              businessName={user.businessName}
              phone={user.phone}
              address={user.address}
              logoUrl={user.logoUrl}
              signatureUrl={user.signatureUrl}
              stampUrl={user.stampUrl}
              email={user.email}
              receiveNewsletter={user.receiveNewsletter}
            />
          </div>
        )}

        {/* Tab 2: Bank Details */}
        {activeTab === "bank" && (
          <div className="space-y-4">
            <BankSettingsForm
              bankName={user.bankName || null}
              bankAccountNumber={user.bankAccountNumber || null}
              bankAccountName={user.bankAccountName || null}
              isLocked={user.bankAccountLocked || false}
              userFullName={user.name}
            />
          </div>
        )}

        {/* Tab 3: Template Selector */}
        {activeTab === "template" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {tSet("tabTemplate")}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tTmpl("templateSubtitle")}
                </p>
              </div>
              {!isPro && (
                <div className="shrink-0">
                  <UpgradeButton className="text-xs py-2 px-3.5" />
                </div>
              )}
            </div>
            <TemplateSelector
              current={user.invoiceTemplate}
              currentColor={user.invoiceColor}
              currentFont={user.invoiceFont}
            />
          </div>
        )}

        {/* Tab 4: Custom Domain (White-Label - BUSINESS) */}
        {activeTab === "domain" && (
          <div className="space-y-4">
            <CustomDomainForm initialData={domainData} />
          </div>
        )}

        {/* Tab 5: Developer API Keys & Webhooks (BUSINESS) */}
        {activeTab === "developer" && (
          <div className="space-y-4">
            <DeveloperSettingsForm
              isBusiness={developerData.isPro}
              initialApiKeys={developerData.apiKeys}
              initialWebhooks={developerData.webhooks}
            />
          </div>
        )}

        {/* Tab 6: Telegram & Discord Notification Bots (BUSINESS) */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <NotificationSettingsForm initialData={botNotificationData} />
          </div>
        )}

        {/* Tab 7: Security & Password */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <SecurityForm />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

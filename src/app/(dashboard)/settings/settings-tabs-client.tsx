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
  SparklesIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import type { CustomDomainData } from "@/actions/domains";
import type { ApiKeyData, WebhookEndpointData } from "@/actions/developer";
import type { BotNotificationSettings } from "@/actions/notifications";

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
};

export function SettingsTabsClient({
  user,
  domainData,
  developerData,
  botNotificationData,
}: {
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
  const [activeTab, setActiveTab] = useState<
    "profile" | "bank" | "template" | "domain" | "developer" | "notifications" | "security"
  >("profile");

  const isPro = user.plan === "PRO";

  const tabs = [
    { id: "profile", label: tSet("tabProfile"), icon: UserIcon },
    { id: "bank", label: tSet("tabBank"), icon: BuildingLibraryIcon },
    { id: "template", label: tSet("tabTemplate"), icon: DocumentTextIcon },
    { id: "domain", label: tSet("tabDomain"), icon: GlobeAltIcon },
    { id: "developer", label: tSet("tabDeveloper"), icon: CodeBracketIcon },
    { id: "notifications", label: tSet("tabNotifications"), icon: BellAlertIcon },
    { id: "security", label: tSet("tabSecurity"), icon: ShieldCheckIcon },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Page Header (Reactive Translation) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {tSet("title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {tSet("subtitle")}
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
            <TemplateSelector current={user.invoiceTemplate} />
          </div>
        )}

        {/* Tab 4: Custom Domain (White-Label - PRO) */}
        {activeTab === "domain" && (
          <div className="space-y-4">
            <CustomDomainForm initialData={domainData} />
          </div>
        )}

        {/* Tab 5: Developer API Keys & Webhooks (PRO) */}
        {activeTab === "developer" && (
          <div className="space-y-4">
            <DeveloperSettingsForm
              isPro={developerData.isPro}
              initialApiKeys={developerData.apiKeys}
              initialWebhooks={developerData.webhooks}
            />
          </div>
        )}

        {/* Tab 6: Telegram & Discord Notification Bots (PRO) */}
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
  );
}

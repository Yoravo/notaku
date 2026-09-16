"use client";

import { useState, useTransition } from "react";
import {
  CodeBracketIcon,
  KeyIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { UpgradeButton } from "@/components/upgrade-button";
import {
  createApiKeyAction,
  deleteApiKeyAction,
  createWebhookAction,
  deleteWebhookAction,
  type ApiKeyData,
  type WebhookEndpointData,
} from "@/actions/developer";

export function DeveloperSettingsForm({
  isPro,
  initialApiKeys,
  initialWebhooks,
}: {
  isPro: boolean;
  initialApiKeys: ApiKeyData[];
  initialWebhooks: WebhookEndpointData[];
}) {
  const tDev = useTranslations("developer");
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>(initialApiKeys);
  const [webhooks, setWebhooks] = useState<WebhookEndpointData[]>(initialWebhooks);

  // Key creation state
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  // Webhook creation state
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookDesc, setWebhookDesc] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "invoice.created",
    "invoice.paid",
  ]);

  // Copied secret state
  const [copiedSecretId, setCopiedSecretId] = useState<string | null>(null);

  // Feedback states
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Create API Key
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createApiKeyAction({ name: keyName });
      if (res.success && res.rawKey) {
        setNewlyCreatedKey(res.rawKey);
        setKeyName("");
        // Optimistic refresh
        setApiKeys((prev) => [
          {
            id: `temp-${Date.now()}`,
            name: keyName,
            keyPrefix: `${res.rawKey!.slice(0, 12)}...`,
            lastUsedAt: null,
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        setErrorMsg(res.error || tDev("createKeyFailed"));
      }
    });
  };

  // Handle Delete API Key
  const handleDeleteKey = (id: string, name: string) => {
    const confirmText = tDev("deleteKeyConfirm", { name });

    if (!confirm(confirmText)) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await deleteApiKeyAction(id);
      if (res.success) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
        setSuccessMsg(tDev("deleteKeyFailed"));
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || tDev("deleteKeyFailed"));
      }
    });
  };

  // Handle Create Webhook
  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || selectedEvents.length === 0) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createWebhookAction({
        url: webhookUrl,
        description: webhookDesc,
        events: selectedEvents,
      });

      if (res.success) {
        setIsCreateWebhookOpen(false);
        setWebhookUrl("");
        setWebhookDesc("");
        setSuccessMsg(tDev("createWebhookFailed"));
        setTimeout(() => setSuccessMsg(null), 3000);
        // Add optimistic
        setWebhooks((prev) => [
          {
            id: `temp-${Date.now()}`,
            url: webhookUrl,
            secret: "whsec_••••••••••••••••••••••••••••••••",
            events: selectedEvents,
            isActive: true,
            description: webhookDesc || null,
            createdAt: new Date().toISOString(),
            lastLogs: [],
          },
          ...prev,
        ]);
      } else {
        setErrorMsg(res.error || tDev("createWebhookFailed"));
      }
    });
  };

  // Handle Delete Webhook
  const handleDeleteWebhook = (id: string, _url: string) => {
    if (!confirm(tDev("deleteWebhookConfirm"))) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await deleteWebhookAction(id);
      if (res.success) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
        setSuccessMsg(tDev("deleteWebhookFailed"));
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || tDev("deleteWebhookFailed"));
      }
    });
  };

  const copyToClipboard = (text: string, type: "key" | "secret", secretId?: string) => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } else if (secretId) {
      setCopiedSecretId(secretId);
      setTimeout(() => setCopiedSecretId(null), 2000);
    }
  };

  const availableEvents = [
    {
      id: "invoice.created",
      label: "invoice.created",
      desc: tDev("eventInvoiceCreated"),
    },
    {
      id: "invoice.paid",
      label: "invoice.paid",
      desc: tDev("eventInvoicePaid"),
    },
  ];

  if (!isPro) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CodeBracketIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>{tDev("title")}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {tDev("subtitle")}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 p-6 sm:p-7 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-200 font-bold text-sm sm:text-base">
            <SparklesIcon className="w-5 h-5 text-[#0f6b4f] dark:text-emerald-400 shrink-0" />
            <span>{tDev("proNoticeTitle")}</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-300 leading-relaxed">
            {tDev("proNoticeDesc")}
          </p>

          <div className="pt-2">
            <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-colors cursor-pointer min-h-[44px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CodeBracketIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <span>{tDev("title")}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {tDev("subtitle")}
        </p>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-start gap-2">
          <XCircleIcon className="w-5 h-5 shrink-0 text-red-500 dark:text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-2">
          <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: API Keys */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{tDev("apiKeysTitle")}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tDev("apiKeysDesc")}
            </p>
          </div>
          <button
            onClick={() => {
              setIsCreateKeyOpen(true);
              setNewlyCreatedKey(null);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f6b4f] hover:bg-[#0c5740] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 min-h-[44px]"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{tDev("createKeyBtn")}</span>
          </button>
        </div>

        {/* Modal: Create Key */}
        {isCreateKeyOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            {!newlyCreatedKey ? (
              <form onSubmit={handleCreateKey} className="space-y-3">
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {tDev("createKeyBtn")}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {tDev("keyNameLabel")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={tDev("keyNamePlaceholder")}
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-[44px]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isPending || !keyName.trim()}
                    className="px-4 py-2 rounded-xl bg-[#0f6b4f] text-white text-xs font-bold hover:bg-[#0c553e] disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
                  >
                    {isPending ? tDev("saving") : tDev("createKeySubmit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateKeyOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer min-h-[44px]"
                  >
                    {tDev("cancel")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {tDev("keySecretNoticeTitle")}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  {tDev("keySecretNoticeDesc")}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedKey}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newlyCreatedKey, "key")}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px]"
                  >
                    {keyCopied ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-4 h-4" />
                        <span>{tDev("copied")}</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        <span>{tDev("copyKey")}</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateKeyOpen(false);
                      setNewlyCreatedKey(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer min-h-[44px]"
                  >
                    {tDev("dismissNotice")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Key List */}
        {apiKeys.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
            <KeyIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              {tDev("emptyKeys")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{key.name}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 font-mono">
                      {key.keyPrefix}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                    <span>
                      {tDev("keyCreatedCol")}{" "}
                      {new Date(key.createdAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {key.lastUsedAt
                        ? `${tDev("keyLastUsedCol")} ${new Date(key.lastUsedAt).toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                          })}`
                        : tDev("neverUsed")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteKey(key.id, key.name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors self-end sm:self-auto cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title={tDev("deleteKeyConfirm", { name: key.name })}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Webhook Endpoints */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{tDev("webhooksTitle")}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tDev("webhooksDesc")}
            </p>
          </div>
          <button
            onClick={() => setIsCreateWebhookOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 min-h-[44px]"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{tDev("addWebhookBtn")}</span>
          </button>
        </div>

        {/* Modal: Create Webhook */}
        {isCreateWebhookOpen && (
          <form
            onSubmit={handleCreateWebhook}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4"
          >
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              {tDev("addWebhookBtn")}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {tDev("endpointUrlLabel")}
              </label>
              <input
                type="url"
                required
                placeholder={tDev("endpointUrlPlaceholder")}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {tDev("endpointDescLabel")}
              </label>
              <input
                type="text"
                placeholder={tDev("endpointDescPlaceholder")}
                value={webhookDesc}
                onChange={(e) => setWebhookDesc(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                {tDev("eventTypesLabel")}
              </label>
              <div className="space-y-2">
                {availableEvents.map((evt) => {
                  const isChecked = selectedEvents.includes(evt.id);
                  return (
                    <label
                      key={evt.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer min-h-[44px]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEvents([...selectedEvents, evt.id]);
                          } else {
                            setSelectedEvents(selectedEvents.filter((id) => id !== evt.id));
                          }
                        }}
                        className="mt-0.5 rounded text-[#0f6b4f] focus:ring-[#0f6b4f]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {evt.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{evt.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isPending || !webhookUrl.trim() || selectedEvents.length === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 transition-all cursor-pointer min-h-[44px]"
              >
                {isPending ? tDev("saving") : tDev("addWebhookSubmit")}
              </button>
              <button
                type="button"
                onClick={() => setIsCreateWebhookOpen(false)}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer min-h-[44px]"
              >
                {tDev("cancel")}
              </button>
            </div>
          </form>
        )}

        {/* Webhooks List */}
        {webhooks.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
            <GlobeAltIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              {tDev("emptyWebhooks")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono break-all">
                        {wh.url}
                      </span>
                      {wh.description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                          • {wh.description}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {wh.events.map((evt) => (
                        <span
                          key={evt}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWebhook(wh.id, wh.url)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title={tDev("deleteWebhookConfirm")}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Signing Secret */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ShieldCheckIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">{tDev("signingSecretLabel")}</span>
                    <code className="text-slate-800 dark:text-slate-200 font-mono text-[11px] truncate">
                      {wh.secret}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(wh.secret, "secret", wh.id)}
                    className="text-[#0f6b4f] dark:text-emerald-400 hover:text-[#0c5740] font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer min-h-[32px] px-1"
                  >
                    {copiedSecretId === wh.id ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                        <span>{tDev("copied")}</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                        <span>{tDev("copyKey")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Recent Delivery Logs */}
                {wh.lastLogs && wh.lastLogs.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="space-y-1">
                      {wh.lastLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/60"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                log.success ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />
                            <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                              {log.event}
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                              HTTP {log.statusCode || "ERR"} ({log.durationMs}ms)
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(log.createdAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Quick Code Reference / Docs Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm text-white flex items-center gap-2">
            <CodeBracketIcon className="w-4 h-4 text-emerald-400" />
            <span>{tDev("apiDocsTitle")}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
            POST /api/v1/invoices
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-300 font-mono">
          <p className="text-slate-400">{tDev("apiDocsAuthHeader")} <span className="text-emerald-400">Authorization: Bearer ntk_live_...</span></p>
        </div>
      </div>
    </div>
  );
}

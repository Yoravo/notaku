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
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/lib/i18n/context";
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
  const { t, locale } = useLanguage();
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
        setErrorMsg(res.error || "Gagal membuat API Key");
      }
    });
  };

  // Handle Delete API Key
  const handleDeleteKey = (id: string, name: string) => {
    const confirmText =
      locale === "id"
        ? `Hapus API Key "${name}"? Aplikasi yang menggunakan key ini tidak akan bisa mengakses API.`
        : `Revoke API Key "${name}"? Integrations using this key will immediately lose access.`;

    if (!confirm(confirmText)) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await deleteApiKeyAction(id);
      if (res.success) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
        setSuccessMsg(locale === "id" ? "API Key berhasil dihapus" : "API Key deleted successfully");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "Gagal menghapus API Key");
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
        setSuccessMsg(
          locale === "id"
            ? "Webhook endpoint berhasil didaftarkan"
            : "Webhook endpoint registered successfully"
        );
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
        setErrorMsg(res.error || "Gagal mendaftarkan webhook");
      }
    });
  };

  // Handle Delete Webhook
  const handleDeleteWebhook = (id: string, url: string) => {
    const confirmText =
      locale === "id"
        ? `Hapus Webhook endpoint "${url}"?`
        : `Delete Webhook endpoint "${url}"?`;

    if (!confirm(confirmText)) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await deleteWebhookAction(id);
      if (res.success) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
        setSuccessMsg(
          locale === "id" ? "Webhook berhasil dihapus" : "Webhook deleted successfully"
        );
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(res.error || "Gagal menghapus webhook");
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
      desc:
        locale === "id"
          ? "Dipicu saat invoice baru berhasil diterbitkan via Dashboard/API"
          : "Triggered when a new invoice is created",
    },
    {
      id: "invoice.paid",
      label: "invoice.paid",
      desc:
        locale === "id"
          ? "Dipicu saat pembayaran invoice terkonfirmasi lunas (QRIS/VA)"
          : "Triggered when invoice payment is confirmed settled",
    },
  ];

  if (!isPro) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <CodeBracketIcon className="w-5 h-5 text-slate-700" />
            <span>{locale === "id" ? "Developer API & Webhooks" : "Developer API & Webhooks"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {locale === "id"
              ? "Integrasikan NotaKu secara langsung dengan aplikasi, e-commerce, atau sistem internal Anda via REST API & Webhooks."
              : "Directly integrate NotaKu with your website, e-commerce, or backend systems via REST API & Webhooks."}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-7 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-sm sm:text-base">
            <SparklesIcon className="w-5 h-5 text-[#0f6b4f] shrink-0" />
            <span>
              {locale === "id"
                ? "Developer REST API & Webhooks adalah Fitur Eksklusif PRO"
                : "Developer REST API & Webhooks is a PRO Feature"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
            {locale === "id"
              ? "Otomatiskan seluruh siklus penagihan pelanggan Anda: buat faktur otomatis dari checkout aplikasi via REST API Bearer Token, query status pembayaran real-time, dan terima webhook HTTP POST bertanda tangan HMAC-SHA256 saat pelanggan menyelesaikan pembayaran QRIS/VA."
              : "Automate your billing lifecycle: generate invoices programmatically via REST API Bearer Tokens, query real-time payment status, and listen to HMAC-SHA256 signed webhook notifications when clients pay via QRIS/VA."}
          </p>

          <div className="pt-2">
            <UpgradeButton className="inline-flex items-center gap-2 rounded-xl bg-[#0f6b4f] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c5740] transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <CodeBracketIcon className="w-5 h-5 text-slate-700" />
          <span>{locale === "id" ? "Developer API & Webhooks" : "Developer API & Webhooks"}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {locale === "id"
            ? "Kelola API Keys otentikasi Bearer dan Webhook endpoints untuk mengintegrasikan NotaKu dengan sistem eksternal."
            : "Manage Bearer authentication API Keys and Webhook endpoints to integrate NotaKu with your tech stack."}
        </p>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <XCircleIcon className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2">
          <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: API Keys */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-emerald-600" />
              <span>{locale === "id" ? "API Keys (REST API)" : "API Keys (REST API)"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === "id"
                ? "Gunakan API Key sebagai Bearer Token pada header Authorization untuk membuat & membaca invoice."
                : "Use API Key as a Bearer Token in the Authorization header to create and fetch invoices."}
            </p>
          </div>
          <button
            onClick={() => {
              setIsCreateKeyOpen(true);
              setNewlyCreatedKey(null);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f6b4f] hover:bg-[#0c5740] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{locale === "id" ? "Buat API Key Baru" : "Generate API Key"}</span>
          </button>
        </div>

        {/* Modal: Create Key */}
        {isCreateKeyOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            {!newlyCreatedKey ? (
              <form onSubmit={handleCreateKey} className="space-y-3">
                <div className="font-bold text-xs sm:text-sm text-slate-900">
                  {locale === "id" ? "Buat API Key Baru" : "Create New API Key"}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {locale === "id" ? "Nama / Deskripsi Penggunaan Key" : "Key Name / Identifier"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      locale === "id"
                        ? "Misal: Backend Laravel Produksi, Toko Online Next.js"
                        : "E.g., Production Backend, Next.js Storefront"
                    }
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isPending || !keyName.trim()}
                    className="px-4 py-2 rounded-xl bg-[#0f6b4f] text-white text-xs font-bold hover:bg-[#0c5740] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isPending
                      ? locale === "id"
                        ? "Membuat..."
                        : "Generating..."
                      : locale === "id"
                      ? "Generate Key"
                      : "Generate Key"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateKeyOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    {locale === "id" ? "Batal" : "Cancel"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    {locale === "id"
                      ? "API Key Berhasil Dibuat!"
                      : "API Key Generated Successfully!"}
                  </span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <strong>{locale === "id" ? "PENTING:" : "IMPORTANT:"}</strong>{" "}
                  {locale === "id"
                    ? "Salin API Key ini sekarang. Untuk alasan keamanan, secret key lengkap hanya ditampilkan SATU KALI ini dan tidak dapat dilihat lagi setelah ditutup."
                    : "Copy this API Key now. For security reasons, the full raw key is only shown ONCE and cannot be recovered after closing."}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedKey}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newlyCreatedKey, "key")}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                  >
                    {keyCopied ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-4 h-4" />
                        <span>{locale === "id" ? "Disalin!" : "Copied!"}</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        <span>{locale === "id" ? "Salin" : "Copy"}</span>
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
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {locale === "id" ? "Selesai & Tutup" : "Done & Close"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Key List */}
        {apiKeys.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <KeyIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              {locale === "id" ? "Belum ada API Key" : "No API Keys yet"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {locale === "id"
                ? "Klik tombol 'Buat API Key Baru' untuk mulai mengintegrasikan API."
                : "Click 'Generate API Key' to start integrating with our REST API."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{key.name}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                      {key.keyPrefix}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>
                      {locale === "id" ? "Dibuat:" : "Created:"}{" "}
                      {new Date(key.createdAt).toLocaleDateString(
                        locale === "id" ? "id-ID" : "en-US",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                    <span>•</span>
                    <span>
                      {key.lastUsedAt
                        ? `${locale === "id" ? "Terakhir aktif:" : "Last used:"} ${new Date(
                            key.lastUsedAt
                          ).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                            day: "numeric",
                            month: "short",
                          })}`
                        : locale === "id"
                        ? "Belum pernah digunakan"
                        : "Never used"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteKey(key.id, key.name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors self-end sm:self-auto cursor-pointer"
                  title={locale === "id" ? "Hapus API Key" : "Revoke Key"}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Webhook Endpoints */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-emerald-600" />
              <span>{locale === "id" ? "Webhook Endpoints" : "Webhook Endpoints"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === "id"
                ? "Daftarkan URL HTTPS server Anda untuk menerima notifikasi otomatis saat invoice terbit atau terbayar."
                : "Register HTTPS URLs to receive automated notifications when invoices are issued or paid."}
            </p>
          </div>
          <button
            onClick={() => setIsCreateWebhookOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{locale === "id" ? "Tambah Webhook" : "Add Webhook"}</span>
          </button>
        </div>

        {/* Modal: Create Webhook */}
        {isCreateWebhookOpen && (
          <form
            onSubmit={handleCreateWebhook}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
          >
            <div className="font-bold text-xs sm:text-sm text-slate-900">
              {locale === "id" ? "Daftarkan Webhook Baru" : "Register New Webhook"}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {locale === "id" ? "Payload URL (HTTPS Wajib)" : "Payload URL (HTTPS Required)"}
              </label>
              <input
                type="url"
                required
                placeholder="https://api.yourdomain.com/webhooks/notaku"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {locale === "id" ? "Deskripsi (Opsional)" : "Description (Optional)"}
              </label>
              <input
                type="text"
                placeholder={
                  locale === "id"
                    ? "Misal: Auto fulfillment server webhook"
                    : "E.g., Production payment listener"
                }
                value={webhookDesc}
                onChange={(e) => setWebhookDesc(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:border-[#0f6b4f] focus:outline-none focus:ring-1 focus:ring-[#0f6b4f] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                {locale === "id" ? "Pilih Event Langganan:" : "Subscribe to Events:"}
              </label>
              <div className="space-y-2">
                {availableEvents.map((evt) => {
                  const isChecked = selectedEvents.includes(evt.id);
                  return (
                    <label
                      key={evt.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/70 transition-colors cursor-pointer"
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
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          {evt.label}
                        </div>
                        <div className="text-[11px] text-slate-500">{evt.desc}</div>
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
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isPending
                  ? locale === "id"
                    ? "Menyimpan..."
                    : "Saving..."
                  : locale === "id"
                  ? "Daftarkan Webhook"
                  : "Register Webhook"}
              </button>
              <button
                type="button"
                onClick={() => setIsCreateWebhookOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all cursor-pointer"
              >
                {locale === "id" ? "Batal" : "Cancel"}
              </button>
            </div>
          </form>
        )}

        {/* Webhooks List */}
        {webhooks.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <GlobeAltIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              {locale === "id" ? "Belum ada Webhook Endpoint" : "No Webhook Endpoints yet"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {locale === "id"
                ? "Tambahkan endpoint HTTPS untuk menerima event notifikasi otomatis."
                : "Add an HTTPS endpoint to receive real-time webhook payloads."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 font-mono break-all">
                        {wh.url}
                      </span>
                      {wh.description && (
                        <span className="text-xs text-slate-500 font-sans">
                          • {wh.description}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {wh.events.map((evt) => (
                        <span
                          key={evt}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWebhook(wh.id, wh.url)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    title={locale === "id" ? "Hapus Webhook" : "Delete Webhook"}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Signing Secret */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ShieldCheckIcon className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-slate-500 shrink-0 font-medium">Signing Secret:</span>
                    <code className="text-slate-800 font-mono text-[11px] truncate">
                      {wh.secret}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(wh.secret, "secret", wh.id)}
                    className="text-[#0f6b4f] hover:text-[#0c5740] font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedSecretId === wh.id ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                        <span>{locale === "id" ? "Disalin" : "Copied"}</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                        <span>{locale === "id" ? "Salin" : "Copy"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Recent Delivery Logs */}
                {wh.lastLogs && wh.lastLogs.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {locale === "id" ? "Riwayat Pengiriman Terbaru" : "Recent Delivery Logs"}
                    </div>
                    <div className="space-y-1">
                      {wh.lastLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/70"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                log.success ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />
                            <span className="font-mono text-[11px] text-slate-800 font-medium">
                              {log.event}
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              HTTP {log.statusCode || "ERR"} ({log.durationMs}ms)
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString(
                              locale === "id" ? "id-ID" : "en-US",
                              { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                            )}
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
      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm text-white flex items-center gap-2">
            <CodeBracketIcon className="w-4 h-4 text-emerald-400" />
            <span>{locale === "id" ? "Contoh Request REST API" : "REST API Example Request"}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
            POST /api/v1/invoices
          </span>
        </div>

        <div className="bg-slate-950 rounded-xl p-3.5 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
          <pre>{`curl -X POST https://notaku.store/api/v1/invoices \\
  -H "Authorization: Bearer ntk_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer": {
      "name": "PT Maju Bersama",
      "email": "finance@majubersama.com"
    },
    "currency": "IDR",
    "dueDate": "2026-09-30",
    "items": [
      {
        "description": "Jasa Pembuatan Website & Domain",
        "quantity": 1,
        "price": 3500000
      }
    ]
  }'`}</pre>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {locale === "id"
            ? "Header signature webhook diverifikasi menggunakan format: x-notaku-signature: t=<timestamp>,v1=<hmac_sha256>. Payload response berisi URL invoice publik dan link stream PDF instan."
            : "Webhook headers carry HMAC signatures formatted as x-notaku-signature: t=<timestamp>,v1=<hmac_sha256>. API responses provide public invoice URLs and instant PDF links."}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  RectangleGroupIcon,
  DocumentTextIcon,
  DocumentPlusIcon,
  UsersIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  GiftIcon,
  ArchiveBoxIcon,
  WalletIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export const COMMAND_PALETTE_EVENT = "notaku:open-command-palette";

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENT));
  }
}

type CommandItem = {
  id: string;
  label: string;
  href: string;
  group: "action" | "page" | "admin";
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
};

const GROUP_LABEL: Record<CommandItem["group"], string> = {
  action: "Aksi Cepat",
  page: "Halaman",
  admin: "Admin",
};

const BASE_ITEMS: CommandItem[] = [
  // Quick actions first — they are what people open the palette for.
  { id: "new-invoice", label: "Buat Invoice Baru", href: "/invoices/new", group: "action", icon: DocumentPlusIcon, keywords: "invoice tagihan faktur baru new create buat" },
  { id: "new-customer", label: "Tambah Pelanggan", href: "/customers?new=1", group: "action", icon: UserPlusIcon, keywords: "customer pelanggan klien tambah baru add" },
  { id: "new-expense", label: "Catat Pengeluaran", href: "/expenses?new=1", group: "action", icon: BanknotesIcon, keywords: "expense pengeluaran beban biaya catat" },
  { id: "new-recurring", label: "Buat Invoice Berulang", href: "/recurring-invoices/new", group: "action", icon: ArrowPathIcon, keywords: "recurring berulang langganan periodik jadwal" },
  { id: "export-pl", label: "Ekspor Rekap Laba Rugi (CSV)", href: "/api/reports/profit-loss/export", group: "action", icon: DocumentChartBarIcon, keywords: "ekspor laba rugi profit loss p&l csv download unduh beban pendapatan" },

  { id: "dashboard", label: "Dashboard", href: "/dashboard", group: "page", icon: RectangleGroupIcon, keywords: "dashboard beranda ringkasan overview home" },
  { id: "invoices", label: "Daftar Invoice", href: "/invoices", group: "page", icon: DocumentTextIcon, keywords: "invoice tagihan faktur daftar list" },
  { id: "recurring", label: "Invoice Berulang", href: "/recurring-invoices", group: "page", icon: ArrowPathIcon, keywords: "recurring berulang langganan periodik" },
  { id: "items", label: "Katalog Produk & Jasa", href: "/items", group: "page", icon: ArchiveBoxIcon, keywords: "item katalog produk jasa barang layanan harga" },
  { id: "expenses", label: "Pengeluaran", href: "/expenses", group: "page", icon: BanknotesIcon, keywords: "expense pengeluaran beban biaya operasional" },
  { id: "tax", label: "Laporan Pajak", href: "/tax-reports", group: "page", icon: DocumentChartBarIcon, keywords: "pajak ppn tax spt laporan omset" },
  { id: "customers", label: "Buku Pelanggan", href: "/customers", group: "page", icon: UsersIcon, keywords: "customer pelanggan klien buku kontak" },
  { id: "wallet", label: "Dompet & Saldo", href: "/wallet", group: "page", icon: WalletIcon, keywords: "wallet dompet saldo balance penarikan payout" },
  { id: "referrals", label: "Program Referral", href: "/referrals", group: "page", icon: GiftIcon, keywords: "referral afiliasi komisi bonus undang" },
  { id: "billing", label: "Langganan & Upgrade", href: "/billing", group: "page", icon: SparklesIcon, keywords: "billing langganan upgrade pro paket bayar" },
  { id: "settings", label: "Pengaturan", href: "/settings", group: "page", icon: Cog6ToothIcon, keywords: "settings pengaturan profil rekening domain api" },
];

const ADMIN_ITEMS: CommandItem[] = [
  { id: "admin", label: "Admin Panel", href: "/admin", group: "admin", icon: ShieldCheckIcon, keywords: "admin panel analytics kelola" },
  { id: "admin-users", label: "Admin · Kelola User", href: "/admin/users", group: "admin", icon: UsersIcon, keywords: "admin user pengguna kelola role plan" },
  { id: "admin-payouts", label: "Admin · Approval Payout", href: "/admin/payouts", group: "admin", icon: BanknotesIcon, keywords: "admin payout penarikan approval cair" },
];

function scoreItem(item: CommandItem, query: string): number {
  const haystack = `${item.label} ${item.keywords}`.toLowerCase();
  const label = item.label.toLowerCase();

  if (label.startsWith(query)) return 3;
  if (label.includes(query)) return 2;
  if (haystack.includes(query)) return 1;
  return 0;
}

export function CommandPalette({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => (isAdmin ? [...BASE_ITEMS, ...ADMIN_ITEMS] : BASE_ITEMS),
    [isAdmin]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const runItem = useCallback(
    (item: CommandItem) => {
      close();
      // API routes (e.g. CSV export) need a hard navigation to trigger download.
      if (item.href.startsWith("/api/")) {
        window.location.href = item.href;
      } else {
        router.push(item.href);
      }
    },
    [close, router]
  );

  // Global hotkey: Ctrl+K / Cmd+K toggles the palette.
  // A custom event lets the header button open it without prop drilling.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onOpenEvent = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_PALETTE_EVENT, onOpenEvent);
    };
  }, []);

  // Focus input and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) runItem(target);
    }
  };

  if (!open) return null;

  let renderedGroup: CommandItem["group"] | null = null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center p-4 pt-[12vh] sm:pt-[15vh] bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={close}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search field */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4">
          <MagnifyingGlassIcon className="w-5 h-5 shrink-0 text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Cari halaman atau aksi cepat..."
            aria-label="Cari halaman atau aksi cepat"
            autoComplete="off"
            className="flex-1 bg-transparent py-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />
          <kbd className="hidden sm:inline-block shrink-0 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((item, index) => {
              const showGroupHeader =
                !query.trim() && item.group !== renderedGroup;
              if (showGroupHeader) renderedGroup = item.group;
              const isActive = index === activeIndex;

              return (
                <div key={item.id}>
                  {showGroupHeader && (
                    <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {GROUP_LABEL[item.group]}
                    </p>
                  )}
                  <button
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => runItem(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors min-h-[44px] ${
                      isActive
                        ? "bg-[#0f6b4f]/10 dark:bg-emerald-500/15 text-[#0f6b4f] dark:text-emerald-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive
                          ? "text-[#0f6b4f] dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <ArrowRightIcon className="w-4 h-4 shrink-0 opacity-70" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="hidden sm:flex items-center gap-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 font-bold">↑↓</kbd>
            Navigasi
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 font-bold">↵</kbd>
            Buka
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 font-bold">Ctrl</kbd>
            <kbd className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 font-bold">K</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

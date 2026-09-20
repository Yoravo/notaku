/**
 * Single Source of Truth untuk Versi Aplikasi dan Catatan Rilis (Changelog) NotaKu.
 * Seluruh milestone dan perubahan besar (BIG CHANGES) dicatat di sini secara kronologis
 * berdasarkan riwayat commit git riil dan mendukung dwibahasa (ID & EN).
 */

export const APP_VERSION = "0.7.4";
export const APP_RELEASE_DATE = {
  id: "21 September 2026",
  en: "September 21, 2026",
};

export type ChangelogCategory = "feat" | "perf" | "fix" | "security";
export type ReleaseSemverType = "major" | "minor" | "patch";

export interface ChangelogItem {
  category: ChangelogCategory;
  text: {
    id: string;
    en: string;
  };
}

export interface ChangelogRelease {
  version: string;
  type: ReleaseSemverType;
  date: {
    id: string;
    en: string;
  };
  title: {
    id: string;
    en: string;
  };
  summary: {
    id: string;
    en: string;
  };
  highlights: ChangelogItem[];
  isLatest?: boolean;
}

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: "0.7.4",
    type: "patch",
    date: {
      id: "21 September 2026",
      en: "September 21, 2026",
    },
    title: {
      id: "PWA Offline Read-Only Data Caching & Workspace Offline",
      en: "PWA Offline Read-Only Data Caching & Offline Workspace",
    },
    summary: {
      id: "Dukungan akses riwayat invoice dan kontak pelanggan secara offline (read-only) saat koneksi internet terputus, dilengkapi navigasi tab interaktif serta tombol aksi cepat WhatsApp dan telepon langsung.",
      en: "Offline read-only access to recent invoices and customer contact records when connection drops, featuring an interactive tabbed workspace with direct WhatsApp and phone call actions.",
    },
    isLatest: true,
    highlights: [
      {
        category: "feat",
        text: {
          id: "Workspace Data Offline: Halaman /offline kini menampilkan salinan riwayat invoice terakhir dan buku pelanggan tersimpan dengan status badge dan total rupiah.",
          en: "Offline Data Workspace: The /offline page now renders cached recent invoices and client records complete with status badges and currency totals.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Aksi Kontak Klien Offline: Tombol cepat WhatsApp dan Telepon pada kartu pelanggan offline untuk komunikasi darurat tanpa sinyal data.",
          en: "Offline Client Actions: Instant WhatsApp and Phone call shortcuts on offline customer cards for emergency client communication.",
        },
      },
      {
        category: "perf",
        text: {
          id: "Cache Navigasi Service Worker: SW kini menyimpan halaman navigasi yang pernah dibuka sehingga dapat dimuat kembali saat offline sebelum fallback.",
          en: "Service Worker Navigation Caching: SW caches visited navigation routes to render previously viewed pages offline before fallback.",
        },
      },
    ],
  },
  {
    version: "0.7.3",
    type: "patch",
    date: {
      id: "21 September 2026",
      en: "September 21, 2026",
    },
    title: {
      id: "Toast Notifikasi Pembaruan Aplikasi PWA Otomatis",
      en: "Automated PWA Service Worker Update Notification Toast",
    },
    summary: {
      id: "Pemberitahuan pembaruan versi baru secara real-time saat aplikasi PWA NotaKu diperbarui di server, lengkap dengan tombol muat ulang interaktif agar pengguna selalu mendapatkan versi terkini tanpa lag cache.",
      en: "Real-time new version notification when NotaKu PWA updates are deployed, featuring an interactive one-tap reload action to ensure users stay on the latest version without cache lag.",
    },
    isLatest: false,
    highlights: [
      {
        category: "feat",
        text: {
          id: "Toast Update PWA Interaktif: Deteksi service worker baru yang sedang menunggu (waiting) dan tampilkan toast mengambang 'Versi Baru Tersedia · Muat Ulang'.",
          en: "Interactive PWA Update Toast: Detects waiting service workers and presents an elegant floating notification with a one-tap reload action.",
        },
      },
      {
        category: "perf",
        text: {
          id: "Pemeriksaan Update Proaktif: Pengecekan otomatis saat tab browser atau jendela aplikasi PWA kembali difokuskan (window focus).",
          en: "Proactive Update Checks: Automatically re-checks for newer service workers when the browser tab or PWA window regains focus.",
        },
      },
    ],
  },
  {
    version: "0.7.2",
    type: "patch",
    date: {
      id: "20 September 2026",
      en: "September 20, 2026",
    },
    title: {
      id: "Banner Pemasangan PWA Kustom (A2HS) untuk Android & iOS",
      en: "Custom PWA Install Prompt Banner (A2HS) for Android & iOS",
    },
    summary: {
      id: "Kemudahan memasang aplikasi NotaKu langsung ke layar utama (Add to Home Screen) di Android dan iOS Safari dengan deteksi otomatis, panduan interaktif, dan status dismiss tersimpan per pengguna.",
      en: "Seamlessly install NotaKu to your home screen (Add to Home Screen) on Android and iOS Safari with automatic prompt detection, interactive step guides, and user-scoped dismissal persistence.",
    },
    isLatest: false,
    highlights: [
      {
        category: "feat",
        text: {
          id: "Banner PWA Kustom di Dasbor: Pemasangan 1-klik native untuk browser Chromium (Android/Desktop) dan panduan langkah resmi untuk iOS Safari.",
          en: "Custom PWA Dashboard Banner: 1-click native installation for Chromium browsers (Android/Desktop) and official step-by-step guidance for iOS Safari.",
        },
      },
      {
        category: "perf",
        text: {
          id: "State Dismiss Per Pengguna & Anti-Duplikasi: Banner tidak akan muncul kembali jika aplikasi sudah terpasang (standalone) atau telah ditutup oleh pengguna.",
          en: "User-Scoped Dismissal & Duplicate Prevention: Banner is hidden if already running in standalone mode or dismissed by the user.",
        },
      },
    ],
  },
  {
    version: "0.7.1",
    type: "patch",
    date: {
      id: "20 September 2026",
      en: "September 20, 2026",
    },
    title: {
      id: "Auto-Save Draf Offline & Harmonisasi Kontras Dark Mode Menyeluruh",
      en: "Offline Invoice Auto-Save & Comprehensive Dark Mode Contrast Polish",
    },
    summary: {
      id: "Pencegahan kehilangan data formulir invoice dengan auto-save lokal di browser dan banner pemulihan otomatis, ditambah peningkatan kontras visual chart (Cashflow & Trafik) dan harmonisasi token dark mode di seluruh antarmuka.",
      en: "Prevention of form data loss with browser-local auto-save and seamless recovery banners, alongside visual contrast enhancements across charts (Cashflow & Traffic) and full dark mode color token harmonization.",
    },
    isLatest: false,
    highlights: [
      {
        category: "feat",
        text: {
          id: "Auto-Save Draf Invoice Offline: Simpan isian form secara otomatis (debounced) ke localStorage dan tampilkan banner pemulihan bila tab tertutup atau koneksi terputus.",
          en: "Offline Invoice Auto-Save: Automatically debounces and saves form progress to localStorage with an intuitive recovery banner upon browser restart or connection drop.",
        },
      },
      {
        category: "perf",
        text: {
          id: "Peningkatan Kontras Visual Chart & Data-Viz: Batang chart Collected & Billed, tooltip hover, dan ringkasan P&L dioptimalkan agar kontras tajam di mode gelap.",
          en: "Chart & Data-Viz Contrast Polish: Collected & Billed chart bars, hover tooltips, and P&L cards optimized for razor-sharp legibility in dark mode.",
        },
      },
      {
        category: "fix",
        text: {
          id: "Harmonisasi Token Warna Dark Mode: Penyesuaian global status badge faktur dan chip metrik agar tidak nyaru atau menyilaukan di latar gelap.",
          en: "Dark Mode Color Token Harmonization: System-wide adjustment of invoice status badges and metric chips to eliminate washed-out or blinding contrast.",
        },
      },
    ],
  },
  {
    version: "0.7.0",
    type: "minor",
    date: {
      id: "20 September 2026",
      en: "September 20, 2026",
    },
    title: {
      id: "Arsitektur 3-Tier Pricing (Starter, Pro, Business) & Standar Keamanan OWASP",
      en: "3-Tier Pricing Architecture (Starter, Pro, Business) & OWASP Security Standards",
    },
    summary: {
      id: "Restrukturisasi paket komersial menjadi 3 tier (Starter Rp0, Pro Rp49k, Business Rp99k), pemisahan fitur branding agensi & developer tools ke tier Business, serta penguatan keamanan pembayaran sesuai standar OWASP.",
      en: "Commercial tier restructuring into 3 plans (Starter Rp0, Pro Rp49k, Business Rp99k), dedicated Business tier for agency branding and developer APIs, plus OWASP payment security hardening.",
    },
    isLatest: false,
    highlights: [
      {
        category: "feat",
        text: {
          id: "Paket NotaKu Business: Tier khusus agensi dan software house dengan fitur Custom Domain, REST API Keys, Webhooks, dan bot notifikasi.",
          en: "NotaKu Business Plan: Dedicated agency tier featuring Custom Domains, REST API Keys, HMAC Webhooks, and notification bots.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Upgrade Modal & Billing Terintegrasi: Pilihan langganan bulanan dan tahunan (hemat 2 bulan) untuk Pro dan Business dengan dukungan kode voucher promo.",
          en: "Integrated Upgrade Modal & Billing: Monthly and annual options (save 2 months) for Pro and Business with promo voucher support.",
        },
      },
      {
        category: "security",
        text: {
          id: "Standar Keamanan OWASP pada Pembayaran: Validasi parameter ketat, kalkulasi harga server-side anti-tampering, rate limit, dan audit logging komprehensif.",
          en: "OWASP Payment Security Standards: Strict parameter whitelisting, server-side anti-tampering price calculation, rate limiting, and comprehensive audit logs.",
        },
      },
      {
        category: "perf",
        text: {
          id: "Harmonisasi UI 3-Tier: Tampilan tabel perbandingan fitur 3 kolom di billing dan 3 kartu paket responsif di landing page.",
          en: "3-Tier UI Harmonization: 3-column feature comparison table in billing and 3 responsive plan cards on the landing page.",
        },
      },
    ],
  },
  {
    version: "0.6.1",
    type: "patch",
    date: {
      id: "19 September 2026",
      en: "September 19, 2026",
    },
    title: {
      id: "Optimasi SEO Google Maksimal, Rich Snippets & Penguatan Keamanan",
      en: "Google SEO Maximization, Rich Snippets & Security Hardening",
    },
    summary: {
      id: "Penyempurnaan teknis SEO & indexing: penambahan schema markup terstruktur (WebSite Sitelinks Searchbox, FAQPage, ItemList, BreadcrumbList), eliminasi dobel suffix title, audit robots.txt & hreflang, serta penguatan proteksi otorisasi admin.",
      en: "Technical SEO and indexation polish: structured JSON-LD schemas (WebSite Sitelinks Searchbox, FAQPage, ItemList, Breadcrumbs), title de-duplication, robots.txt and hreflang alternates, plus admin authorization guard hardening.",
    },
    isLatest: false,
    highlights: [
      {
        category: "perf",
        text: {
          id: "Google Rich Results & Sitelinks Searchbox: Penambahan WebSite SearchAction schema pada homepage untuk mendukung pencarian langsung dari Google SERP.",
          en: "Google Rich Results & Sitelinks Searchbox: Added WebSite SearchAction schema to support direct template search from Google SERP.",
        },
      },
      {
        category: "perf",
        text: {
          id: "FAQPage & Breadcrumbs Schema: Integrasi schema FAQ interaktif pada kalkulator pajak (PPN & PPh 23) serta BreadcrumbList pada katalog template.",
          en: "FAQPage & Breadcrumbs Schema: Integrated rich Q&A snippets on tax calculators and BreadcrumbList on invoice template catalog pages.",
        },
      },
      {
        category: "fix",
        text: {
          id: "De-duplikasi Title & Meta Robots: Pencegahan penumpukan suffix brand dobel pada SERP dan penambahan proteksi noindex di layout dashboard & admin.",
          en: "Title De-duplication & Meta Robots: Prevented duplicate brand title suffixes and enforced noindex headers across dashboard and admin areas.",
        },
      },
      {
        category: "security",
        text: {
          id: "Penguatan Otorisasi Admin: Penambahan guard requireAdmin() pada Server Action getPromoCodes untuk mencegah akses data voucher tanpa login admin.",
          en: "Admin Authorization Hardening: Enforced requireAdmin() check on getPromoCodes action to protect voucher data from unauthorized queries.",
        },
      },
    ],
  },
  {
    version: "0.6.0",
    type: "minor",
    date: {
      id: "19 September 2026",
      en: "September 19, 2026",
    },
    title: {
      id: "PWA App Shortcuts, Global Command Palette (Ctrl+K) & Ekspor Laba Rugi",
      en: "PWA App Shortcuts, Global Command Palette (Ctrl+K) & Profit/Loss Export",
    },
    summary: {
      id: "Peningkatan aksesibilitas mobile dan produktivitas: dukungan PWA modern dengan aksi cepat long-press icon aplikasi, command palette global keyboard-driven, ekspor laporan laba rugi CSV, serta penguatan dark mode.",
      en: "Mobile accessibility and productivity enhancements: modern PWA support with long-press quick actions, global keyboard-driven command palette, CSV profit and loss financial export, and dark-mode style hardening.",
    },
    highlights: [
      {
        category: "feat",
        text: {
          id: "PWA Modern & App Shortcuts: Aksi cepat langsung dari icon homescreen Android/iOS untuk Buat Invoice, Buat Kuitansi, dan Catat Pengeluaran.",
          en: "Modern PWA & App Shortcuts: Quick launch actions directly from Android/iOS homescreen icon for New Invoice, New Receipt, and Record Expense.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Service Worker Caching & Offline Fallback: Dukungan halaman offline otomatis ketika koneksi internet pengguna terputus.",
          en: "Service Worker Caching & Offline Fallback: Automatic offline fallback page when internet connectivity is interrupted.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Global Command Palette (Ctrl+K / Cmd+K): Modal pencarian cepat lintas halaman, aksi pembuatan invoice/pelanggan/beban usaha secara keyboard-driven.",
          en: "Global Command Palette (Ctrl+K / Cmd+K): Fast modal search across all pages and quick actions for invoices, customers, and expenses.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Ekspor Rekap Laba Rugi (P&L CSV): Unduh laporan perbandingan pendapatan invoice lunas vs beban usaha bulanan/tahunan siap audit.",
          en: "Profit & Loss CSV Export: Download monthly/annual revenue vs expense balance reports ready for financial audits.",
        },
      },
      {
        category: "fix",
        text: {
          id: "Harmonisasi Dark Mode: Perbaikan guard CSS :not() untuk mencegah style global menimpa kartu finansial dan border validasi form.",
          en: "Dark Mode Harmonization: CSS :not() attribute guards to prevent global overrides from conflicting with financial cards and validation borders.",
        },
      },
    ],
  },
  {
    version: "0.5.0",
    type: "minor",
    date: {
      id: "18 September 2026",
      en: "September 18, 2026",
    },
    title: {
      id: "Katalog Produk & Jasa, Pencatatan Pengeluaran (Expenses), dan Ringkasan Laba Bersih",
      en: "Product & Service Catalog, Expense Tracking, and Net Profit Summary",
    },
    summary: {
      id: "Ekspansi manajemen operasional usaha: simpan daftar harga barang/jasa untuk autofill invoice, catat beban operasional, dan pantau laba bersih secara real-time di dashboard utama.",
      en: "Business operations expansion: save product/service price catalogs for 1-click invoice autofill, track operational expenses, and monitor net profit directly on the main dashboard.",
    },
    highlights: [
      {
        category: "feat",
        text: {
          id: "Katalog Produk & Jasa (/items): Manajemen daftar harga barang dan layanan lengkap dengan satuan unit dan deskripsi standar.",
          en: "Product & Service Catalog (/items): Comprehensive item and rate management with custom measurement units and descriptions.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Autofill 1-Klik dari Katalog: Masukkan rincian barang ke form pembuatan invoice secara instan tanpa mengetik ulang.",
          en: "1-Click Catalog Autofill: Insert pre-saved item details into invoice line items without manual retyping.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Pencatatan Beban Usaha (/expenses): Catat pengeluaran operasional, gaji, sewa, pemasaran, dan alat dengan filter bulan.",
          en: "Operational Expense Tracking (/expenses): Log business overhead, salaries, rent, marketing, and tools with monthly filtering.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Kartu Laba Bersih di Dashboard: Kalkulasi otomatis Pendapatan Lunas dikurangi Total Beban Usaha untuk mengukur kesehatan finansial.",
          en: "Net Profit Dashboard Card: Automatic calculation of Paid Invoices minus Total Expenses for instant business financial health insights.",
        },
      },
      {
        category: "fix",
        text: {
          id: "Perketat sanitasi query filter dan validasi format regex bulan pada Server Component.",
          en: "Hardened query parameter sanitization and strict regex month validation on Server Components.",
        },
      },
    ],
  },
  {
    version: "0.4.0",
    type: "minor",
    date: {
      id: "13 September 2026",
      en: "September 13, 2026",
    },
    title: {
      id: "Migrasi Internasionalisasi (next-intl), Kustomisasi PDF & Newsletter Digest",
      en: "Internationalization (next-intl) Migration, PDF Customization & Digest Newsletter",
    },
    summary: {
      id: "Pembaruan arsitektur antarmuka: dukungan dwibahasa penuh (Indonesia & English) berbasis next-intl di seluruh dashboard/admin/portal, kustomisasi font & warna aksen template invoice, serta buletin performa mingguan.",
      en: "UI architecture milestone: complete bilingual support (Indonesian & English) via next-intl across all modules, customizable PDF accent colors and fonts, plus weekly performance digest newsletters.",
    },
    highlights: [
      {
        category: "feat",
        text: {
          id: "Fondasi Bilingual next-intl: Translasi menyeluruh komponen dashboard, sidebar, autentikasi, manajemen invoice, dan panel admin.",
          en: "Full next-intl Bilingual Engine: End-to-end translation covering dashboard, sidebar, auth, invoice management, and admin panels.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Kustomisasi Desain PDF (PRO): Pilihan 5 warna aksen dokumen dan 3 tipografi standar (Helvetica, Times, Courier) dengan sinkronisasi live preview.",
          en: "PDF Design Customization (PRO): 5 accent document colors and 3 typography options with live preview synchronization.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Weekly Product Digest Automation: Cron job pengiriman email rekap performa tagihan 7 hari terakhir dan tips bisnis otomatis berbasis WIB.",
          en: "Weekly Performance Digest: Automated cron email reporting 7-day billing performance and business tips tailored for Asia/Jakarta time.",
        },
      },
      {
        category: "security",
        text: {
          id: "Atribusi GA4 Measurement Protocol server-side dengan first-touch UTM persistence dan idempotency guard.",
          en: "Server-side GA4 Measurement Protocol tracking with first-touch UTM persistence and webhook idempotency guards.",
        },
      },
    ],
  },
  {
    version: "0.3.0",
    type: "minor",
    date: {
      id: "1 September 2026",
      en: "September 1, 2026",
    },
    title: {
      id: "Theme Switcher (Dark Mode), Developer REST API & Webhooks, dan Custom Domain",
      en: "Theme Switcher (Dark Mode), Developer REST API & Webhooks, and Custom Domains",
    },
    summary: {
      id: "Kapabilitas PRO tingkat lanjut untuk integrasi sistem dan branding bisnis: REST API berotentikasi Bearer token, webhook pengiriman bertanda tangan HMAC, white-label domain kustom, alur 1-click clone invoice, dan theme switcher 3 mode.",
      en: "Advanced PRO capabilities for system integration and business branding: Bearer token REST API, HMAC-signed webhooks, white-label custom domains, 1-click invoice clone, and 3-mode theme switcher.",
    },
    highlights: [
      {
        category: "feat",
        text: {
          id: "Theme Switcher 3 Mode: Pilihan Terang (Light), Gelap (Dark), dan Sistem (Otomatis) dengan script inline anti-FOUC.",
          en: "3-Mode Theme Switcher: Light, Dark, and System modes with inline anti-FOUC protection script in root layout.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Developer REST API Keys (PRO): Endpoint /api/v1/invoices untuk integrasi pembuatan faktur dengan hashing token SHA-256 dan rate limit Redis.",
          en: "Developer REST API Keys (PRO): Secure /api/v1/invoices endpoints with SHA-256 key hashing and Redis rate limits.",
        },
      },
      {
        category: "feat",
        text: {
          id: "HMAC-Signed Webhooks: Notifikasi real-time untuk event invoice.created dan invoice.paid dengan signature header anti-tampering.",
          en: "HMAC-Signed Webhooks: Real-time event notifications for invoice creation and payment with anti-tampering signature headers.",
        },
      },
      {
        category: "feat",
        text: {
          id: "White-Label Subdomain & Custom Domain: Hubungkan subdomain kustom atau nama domain bisnis sendiri dengan verifikasi DNS CNAME & TXT.",
          en: "White-Label Subdomain & Custom Domain: Connect personalized business domains with automatic DNS CNAME & TXT verification.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Customer Billing Portal (/portal/[id]): Halaman riwayat tagihan mandiri bagi klien untuk mengunduh PDF dan melunasi pembayaran online.",
          en: "Customer Billing Portal (/portal/[id]): Self-service billing portal for clients to review invoices, download receipts, and pay online.",
        },
      },
      {
        category: "feat",
        text: {
          id: "1-Click Clone Invoice: Gandakan tagihan yang sudah ada secara atomik ke draft baru tanpa mengisi ulang rincian barang dan pelanggan.",
          en: "1-Click Invoice Clone: Duplicate existing invoices atomically into fresh drafts without manual re-entry.",
        },
      },
    ],
  },
  {
    version: "0.2.0",
    type: "minor",
    date: {
      id: "29 Agustus 2026",
      en: "August 29, 2026",
    },
    title: {
      id: "Migrasi Mayar.id, Pusat Alat Bisnis (/tools), Invoice Berulang & Program Referral",
      en: "Mayar.id Gateway, Business Tools Hub (/tools), Recurring Billing & Referral Program",
    },
    summary: {
      id: "Strategi akuisisi organik dan otomatisasi billing: integrasi tunggal Mayar.id untuk settlement QRIS, generator invoice & kuitansi gratis, kalkulator pajak PPh 23, program bagi hasil referral pengguna, dan jadwal invoice berkala.",
      en: "Organic acquisition and billing automation: unified Mayar.id gateway for QRIS settlement, free receipt & delivery order tools, income tax 23 calculator, user referral affiliate rewards, and recurring invoices.",
    },
    highlights: [
      {
        category: "feat",
        text: {
          id: "Integrasi Payment Gateway Mayar.id: Pembayaran digital via QRIS dan Virtual Account dengan pemotongan MDR 0.7% dan auto-settlement saldo.",
          en: "Mayar.id Payment Gateway: Digital payments via QRIS & Virtual Accounts with automatic settlement to seller balance.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Pusat Alat Bisnis (/tools): Generator Invoice, Kuitansi Resmi Terbilang Rupiah, Surat Jalan Logistik, dan Kalkulator Pajak PPh 23 Jasa.",
          en: "Business Tools Hub (/tools): Free Invoice Generator, Worded Number Official Receipts, Delivery Orders, and PPh 23 Tax Calculator.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Invoice Berulang Otomatis (Recurring Invoices): Penjadwalan mingguan, bulanan, kuartalan dengan auto-dispatch tagihan via cron harian.",
          en: "Automated Recurring Invoices: Weekly, monthly, and quarterly billing schedules with automated daily cron dispatching.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Program Afiliasi & Referral: Tautan referral unik tiap pengguna dengan bonus saldo dompet otomatis saat rekan upgrade ke paket PRO.",
          en: "Referral & Affiliate Program: Unique referral invite links with automatic wallet cash rewards upon PRO upgrades.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Rekap Laporan Pajak PPN & Omset Bulanan: Rekapitulasi 12 masa pajak (DPP, PPN 11%/12%, Omset) lengkap dengan ekspor CSV siap lapor SPT.",
          en: "Monthly VAT & Turnover Tax Reports: 12-tax-period summary (tax base, VAT, turnover) with CSV exports for tax reporting.",
        },
      },
      {
        category: "security",
        text: {
          id: "Verifikasi Rekening Bank via OTP Email: Proteksi rekening bank terkunci (read-only) untuk mencegah manipulasi penipuan pencairan.",
          en: "Bank Account OTP Email Verification: Locked read-only payout bank accounts protected by OTP verification against fraud.",
        },
      },
    ],
  },
  {
    version: "0.1.0",
    type: "major",
    date: {
      id: "24 Mei 2026",
      en: "May 24, 2026",
    },
    title: {
      id: "Peluncuran Perdana NotaKu (MVP)",
      en: "Initial Launch of NotaKu (MVP)",
    },
    summary: {
      id: "Fondasi aplikasi invoice generator dan billing modern untuk UMKM Indonesia dengan dukungan kalkulasi pajak, pengiriman via WhatsApp, ekspor PDF resmi, dan sistem akun terproteksi.",
      en: "Foundation of modern invoice generator and billing SaaS for Indonesian businesses with automatic tax calculations, WhatsApp sharing, official PDF exports, and secured authentication.",
    },
    highlights: [
      {
        category: "feat",
        text: {
          id: "Pembuatan Invoice Kilat: Daftar item dinamis, kalkulasi otomatis subtotal, diskon, PPN, dan nomor faktur otomatis.",
          en: "Fast Invoice Creation: Dynamic line items, automatic calculations for subtotal, discount, tax, and automated sequential numbering.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Render PDF & Kuitansi Resmi: Download dan cetak faktur invoice serta kuitansi tanda terima digital berkualitas tinggi.",
          en: "Official PDF & Receipt Rendering: High-quality downloadable and printable digital invoices and receipts.",
        },
      },
      {
        category: "feat",
        text: {
          id: "Bagi ke WhatsApp 1-Klik: Draf pesan rapi berisi rincian tagihan beserta tautan invoice publik interaktif untuk klien.",
          en: "1-Click WhatsApp Share: Formatted message templates with client invoice details and shareable public links.",
        },
      },
      {
        category: "security",
        text: {
          id: "Autentikasi Aman & Rate Limiting: Better-Auth dengan verifikasi email, Google OAuth, proteksi IDOR, dan rate limiting ketat Upstash Redis.",
          en: "Secure Auth & Rate Limiting: Better-Auth with email verification, Google OAuth, IDOR protection, and Upstash Redis rate limiting.",
        },
      },
    ],
  },
];

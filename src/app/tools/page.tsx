import type { Metadata } from "next";
import Link from "next/link";
import {
  DocumentTextIcon,
  DocumentCheckIcon,
  TruckIcon,
  CalculatorIcon,
  LanguageIcon,
  SparklesIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://notaku.store";

export const metadata: Metadata = {
  title: "Pusat Alat & Kalkulator Bisnis Online Gratis Indonesia · NotaKu Tools Hub",
  description:
    "Kumpulan alat bantu keuangan, generator faktur invoice, kuitansi ejaan terbilang, surat jalan, dan kalkulator pajak PPN & PPh 23 gratis untuk UMKM, freelancer, dan pengusaha Indonesia.",
  keywords: [
    "alat bisnis online gratis",
    "kalkulator keuangan umkm",
    "generator invoice kuitansi surat jalan",
    "tools bisnis indonesia",
    "kalkulator pajak dpp ppn pph",
  ],
  alternates: {
    canonical: `${baseUrl}/tools`,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${baseUrl}/tools`,
    title: "Pusat Alat & Kalkulator Bisnis Online Gratis · NotaKu",
    description:
      "Akses seluruh generator dokumen usaha dan kalkulator pajak gratis tanpa registrasi.",
    siteName: "NotaKu",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Pusat Alat Bisnis Online Gratis - NotaKu",
      },
    ],
  },
};

export default function ToolsHubPage() {
  const tools = [
    {
      title: "Free Invoice Generator",
      desc: "Buat faktur tagihan bisnis online dalam 30 detik tanpa registrasi. Hitung otomatis diskon, DPP, dan PPN 11%/12% lalu download PDF resmi.",
      href: "/buat-invoice",
      icon: DocumentTextIcon,
      badge: "Paling Populer",
      tag: "Tagihan & Faktur",
    },
    {
      title: "Free Kuitansi Generator",
      desc: "Pembuat kuitansi tanda terima sah dengan konversi angka nominal ke kalimat ejaan terbilang rupiah otomatis, stempel lunas, dan ekspor PDF.",
      href: "/buat-kuitansi",
      icon: DocumentCheckIcon,
      badge: "Baru",
      tag: "Tanda Terima Pembayaran",
    },
    {
      title: "Free Surat Jalan (Delivery Order)",
      desc: "Generator dokumen pengiriman barang standar ekspedisi logistik dengan rincian barang, nomor plat kendaraan, dan 3 kolom tanda tangan.",
      href: "/buat-surat-jalan",
      icon: TruckIcon,
      badge: "Baru",
      tag: "Logistik & Gudang",
    },
    {
      title: "Kalkulator PPN 11% & 12%",
      desc: "Kalkulator akurat untuk menghitung DPP (Dasar Pengenaan Pajak) dan PPN sistem include maupun exclude harga pajak.",
      href: "/kalkulator-ppn",
      icon: CalculatorIcon,
      tag: "Pajak Pertambahan Nilai",
    },
    {
      title: "Kalkulator PPh 23 Jasa",
      desc: "Hitung besaran potongan pajak penghasilan pasal 23 (2% ber-NPWP / 4% tanpa NPWP) atas jasa konsultan, freelance, IT, dan sewa.",
      href: "/kalkulator-pph23",
      icon: CalculatorIcon,
      badge: "Baru",
      tag: "Pajak Penghasilan",
    },
    {
      title: "Konverter Terbilang Rupiah",
      desc: "Alat pengubah angka ke huruf kalimat terbilang rupiah resmi bahasa Indonesia untuk penulisan kuitansi, cek bank, dan faktur.",
      href: "/terbilang-rupiah",
      icon: LanguageIcon,
      tag: "Ejaan Bahasa Indonesia",
    },
    {
      title: "Katalog Template Invoice",
      desc: "Contoh format tagihan terstruktur khusus untuk freelance, desainer grafis, web developer, katering, bengkel, kost, dan kontraktor.",
      href: "/templates",
      icon: SparklesIcon,
      tag: "Inspirasi & Desain",
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Top Navbar */}
      <header className="border-b border-border-light bg-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold tracking-tight text-ink hover:opacity-80 transition"
          >
            Nota<span className="text-emerald-500">Ku</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-ink-soft hover:text-ink transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
            <SparklesIcon className="w-4 h-4" />
            100% Gratis • Tanpa Login • Siap Pakai Kapan Saja
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink tracking-tight mb-4">
            Pusat Peralatan Bisnis & Finansial UMKM
          </h1>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            Koleksi lengkap generator dokumen profesional dan kalkulator pajak online resmi untuk membantu Anda mengelola penagihan usaha secara cepat dan akurat.
          </p>
        </div>

        {/* Grid of Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative p-6 rounded-3xl bg-surface border border-border-light hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                    {tool.tag}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-ink group-hover:text-emerald-600 transition-colors mt-1 mb-2">
                    {tool.title}
                  </h2>
                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-light flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>Gunakan Alat Sekarang</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Banner Upsell */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Ingin Penagihan Usaha yang Serba Otomatis?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Buat akun NotaKu untuk mengaktifkan kirim WhatsApp 1-klik, pembayaran QRIS otomatis, rekap laporan omset, dan pembuatan invoice berkala bulanan.
            </p>
          </div>
          <Link
            href="/register"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shrink-0 shadow-lg hover:shadow-xl transition-all"
          >
            Daftar Akun Gratis Sekarang
          </Link>
        </div>
      </main>
    </div>
  );
}

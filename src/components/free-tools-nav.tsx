import Link from "next/link";
import {
  DocumentTextIcon,
  DocumentCheckIcon,
  TruckIcon,
  CalculatorIcon,
  LanguageIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export function FreeToolsNav() {
  const tools = [
    {
      title: "Buat Invoice Online",
      desc: "Generator faktur tagihan bisnis & hitung PPN otomatis.",
      href: "/buat-invoice",
      icon: DocumentTextIcon,
      badge: "Populer",
    },
    {
      title: "Buat Kuitansi Pembayaran",
      desc: "Tanda terima resmi dengan ejaan terbilang rupiah.",
      href: "/buat-kuitansi",
      icon: DocumentCheckIcon,
      badge: "Baru",
    },
    {
      title: "Buat Surat Jalan (DO)",
      desc: "Dokumen pengiriman barang standar logistik 3 tanda tangan.",
      href: "/buat-surat-jalan",
      icon: TruckIcon,
      badge: "Baru",
    },
    {
      title: "Kalkulator PPN 11% / 12%",
      desc: "Hitung DPP dan pajak include/exclude instan.",
      href: "/kalkulator-ppn",
      icon: CalculatorIcon,
    },
    {
      title: "Kalkulator PPh 23 Jasa",
      desc: "Hitung potongan pajak 2% ber-NPWP / 4% tanpa NPWP & PPN.",
      href: "/kalkulator-pph23",
      icon: CalculatorIcon,
      badge: "Baru",
    },
    {
      title: "Konverter Terbilang Rupiah",
      desc: "Ubah angka ke kalimat ejaan rupiah resmi Indonesia.",
      href: "/terbilang-rupiah",
      icon: LanguageIcon,
    },
    {
      title: "Katalog Template Invoice",
      desc: "Contoh format tagihan spesifik untuk berbagai profesi.",
      href: "/templates",
      icon: SparklesIcon,
    },
  ];

  return (
    <section className="mt-14 sm:mt-20 border-t border-border-light pt-12">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-lg sm:text-2xl font-extrabold text-ink tracking-tight">
          Peralatan Bisnis & Keuangan Gratis Lainnya
        </h2>
        <p className="text-xs sm:text-sm text-ink-soft mt-1">
          Gunakan seluruh koleksi alat gratis NotaKu untuk mempercepat operasional usaha Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group p-4 rounded-2xl bg-surface border border-border-light hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs sm:text-sm font-bold text-ink group-hover:text-emerald-600 transition-colors truncate">
                    {tool.title}
                  </span>
                  {tool.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-ink-soft line-clamp-2 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

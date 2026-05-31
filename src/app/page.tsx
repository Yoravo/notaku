import Link from "next/link"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const features = [
  { n: "01", title: "Invoice kilat", desc: "Item dinamis dengan perhitungan total otomatis. Nomor invoice ter-generate sendiri." },
  { n: "02", title: "Share WhatsApp", desc: "Kirim link invoice ke pelanggan langsung lewat WhatsApp dalam sekali klik." },
  { n: "03", title: "Ekspor PDF", desc: "Download invoice sebagai PDF profesional yang siap cetak atau kirim email." },
  { n: "04", title: "Data pelanggan", desc: "Simpan pelanggan sekali, pakai berulang. Tak perlu ketik ulang tiap menagih." },
  { n: "05", title: "Lacak status", desc: "Pantau invoice draft, terkirim, lunas, atau jatuh tempo dalam satu layar." },
  { n: "06", title: "Branding sendiri", desc: "Upgrade ke Pro untuk hapus watermark dan tampilkan identitas bisnismu." },
]

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="grain min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl font-semibold tracking-tight">
          Nota<span className="text-emerald">Ku</span>
        </span>
        <nav className="flex items-center gap-5">
          {session ? (
            <Link href="/dashboard" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-emerald">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                Masuk
              </Link>
              <Link href="/register" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-emerald">
                Daftar Gratis
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-12 lg:grid-cols-2 lg:gap-8 lg:pt-20">
        <div>
          <p className="rise inline-flex items-center gap-2 rounded-full border border-line bg-paper-deep px-3 py-1 text-xs font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
            Dibuat untuk UMKM Indonesia
          </p>
          <h1 className="rise mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl" style={{ animationDelay: "0.1s" }}>
            Tagih pelanggan, <span className="italic text-emerald">tanpa ribet.</span>
          </h1>
          <p className="rise mt-6 max-w-md text-lg leading-relaxed text-ink-soft" style={{ animationDelay: "0.2s" }}>
            Bikin dan kirim invoice profesional dalam 30 detik. Rapi, bisa di-PDF, langsung share ke WhatsApp pelanggan.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.3s" }}>
            <Link href="/register" className="rounded-full bg-emerald px-7 py-3.5 text-sm font-semibold text-paper shadow-lg shadow-emerald/20 transition-all hover:bg-emerald-bright hover:shadow-emerald/30">
              Mulai Gratis
            </Link>
            <a href="#fitur" className="text-sm font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-emerald">
              Lihat cara kerjanya
            </a>
          </div>
          <p className="rise mt-6 text-xs text-ink-soft" style={{ animationDelay: "0.4s" }}>
            Gratis 5 invoice/bulan · Tanpa kartu kredit
          </p>
        </div>

        <div className="relative">
          <div className="tilt-in mx-auto max-w-sm rounded-2xl border border-line bg-white p-7 shadow-2xl shadow-ink/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-semibold">INVOICE</p>
                <p className="tnum text-sm text-ink-soft">INV-2026-014</p>
              </div>
              <span className="rounded-full bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald">
                Lunas
              </span>
            </div>
            <div className="mt-6 border-t border-line pt-4">
              <p className="text-xs uppercase tracking-wide text-ink-soft">Ditagihkan kepada</p>
              <p className="mt-1 font-medium">Warung Bu Sari</p>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Kopi sachet (2 dus)</span>
                <span className="tnum font-medium">Rp180.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Gula 5kg</span>
                <span className="tnum font-medium">Rp75.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Ongkir</span>
                <span className="tnum font-medium">Rp15.000</span>
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-ink pt-4">
              <span className="text-sm font-medium">Total</span>
              <span className="tnum font-display text-2xl font-semibold">Rp270.000</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-2 hidden rotate-[-8deg] rounded-lg border-2 border-ochre/40 px-3 py-1 sm:block">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-ochre/70">Paid</span>
          </div>
        </div>
      </section>

      <section id="fitur" className="border-y border-line bg-paper-deep py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Semua yang kamu butuh untuk menagih.
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.n} className="group">
                <span className="tnum font-display text-sm font-semibold text-emerald">{f.n}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">Harga yang jujur.</h2>
          <p className="mt-3 text-center text-ink-soft">Mulai gratis. Upgrade kalau bisnismu tumbuh.</p>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-8">
              <h3 className="font-display text-xl font-semibold">Free</h3>
              <p className="tnum mt-3 font-display text-4xl font-semibold">
                Rp0<span className="text-base font-normal text-ink-soft">/bln</span>
              </p>
              <ul className="mt-7 space-y-3 text-sm text-ink-soft">
                <li className="flex gap-2"><span className="text-emerald">✓</span> 5 invoice per bulan</li>
                <li className="flex gap-2"><span className="text-emerald">✓</span> Pelanggan unlimited</li>
                <li className="flex gap-2"><span className="text-emerald">✓</span> Download PDF</li>
                <li className="flex gap-2"><span className="text-emerald">✓</span> Share WhatsApp</li>
              </ul>
              <Link href="/register" className="mt-8 block rounded-full border border-ink px-5 py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper">
                Mulai Gratis
              </Link>
            </div>

            <div className="relative rounded-2xl bg-ink p-8 text-paper">
              <span className="absolute right-6 top-8 rounded-full bg-emerald px-3 py-1 text-xs font-semibold">
                Populer
              </span>
              <h3 className="font-display text-xl font-semibold">Pro</h3>
              <p className="tnum mt-3 font-display text-4xl font-semibold">
                Rp49.000<span className="text-base font-normal opacity-60">/bln</span>
              </p>
              <ul className="mt-7 space-y-3 text-sm opacity-90">
                <li className="flex gap-2"><span className="text-emerald-bright">✓</span> Invoice unlimited</li>
                <li className="flex gap-2"><span className="text-emerald-bright">✓</span> Tanpa watermark</li>
                <li className="flex gap-2"><span className="text-emerald-bright">✓</span> Custom branding</li>
                <li className="flex gap-2"><span className="text-emerald-bright">✓</span> Laporan bulanan</li>
              </ul>
              <Link href="/register" className="mt-8 block rounded-full bg-emerald px-5 py-3 text-center text-sm font-semibold text-paper transition-colors hover:bg-emerald-bright">
                Coba Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper-deep py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Berhenti bikin nota manual.
          </h2>
          <p className="mt-4 text-ink-soft">Gabung dengan UMKM yang sudah menagih lebih rapi dengan NotaKu.</p>
          <Link href="/register" className="mt-8 inline-block rounded-full bg-emerald px-8 py-4 text-sm font-semibold text-paper shadow-lg shadow-emerald/20 transition-all hover:bg-emerald-bright">
            Buat Invoice Pertamamu
          </Link>
        </div>
      </section>

      <footer className="py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-ink-soft sm:flex-row">
          <span className="font-display text-lg font-semibold text-ink">Nota<span className="text-emerald">Ku</span></span>
          <span>© 2026 NotaKu. Dibuat untuk UMKM Indonesia.</span>
        </div>
      </footer>
    </div>
  )
}

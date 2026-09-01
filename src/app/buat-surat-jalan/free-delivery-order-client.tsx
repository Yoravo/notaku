"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TruckIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { FreeToolsNav } from "@/components/free-tools-nav";
import { LandingNavbar } from "@/components/landing-navbar";

interface DeliveryItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  notes: string;
}

export function FreeDeliveryOrderGeneratorClient({ session }: { session?: any }) {
  const [orderNumber, setOrderNumber] = useState("SJ-202608-001");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [poNumber, setPoNumber] = useState("PO-982103");
  const [vehicleNumber, setVehicleNumber] = useState("B 1234 CD");
  const [driverName, setDriverName] = useState("Budi Santoso");

  // Pengirim (Sender)
  const [senderName, setSenderName] = useState("Gudang Pusat");
  const [senderBusinessName, setSenderBusinessName] = useState("PT Logistik Prima Nusantara");
  const [senderPhone, setSenderPhone] = useState("0812-9988-7766");
  const [senderAddress, setSenderAddress] = useState("Kawasan Industri Pulogadung Blok C, Jakarta");

  // Penerima (Recipient)
  const [recipientName, setRecipientName] = useState("Bpk. Joko Susilo");
  const [recipientCompany, setRecipientCompany] = useState("Toko Berkah Abadi");
  const [recipientPhone, setRecipientPhone] = useState("0813-1122-3344");
  const [recipientAddress, setRecipientAddress] = useState("Jl. Malioboro No. 88, Yogyakarta");

  // Daftar Barang
  const [items, setItems] = useState<DeliveryItem[]>([
    { id: "1", description: "Beras Premium Ramos 5kg", quantity: 50, unit: "Sak", notes: "Kondisi baru & rapi" },
    { id: "2", description: "Minyak Goreng Botol 2L", quantity: 24, unit: "Karton", notes: "Fragile (Jangan dibanting)" },
    { id: "3", description: "Gula Pasir Kristal Putih 1kg", quantity: 100, unit: "Pcs", notes: "Segel pabrik aman" },
  ]);

  const [notes, setNotes] = useState("Barang telah dicek dan dimuat dalam kondisi lengkap. Harap periksa segel sebelum menandatangani bukti terima.");

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unit: "Pcs",
        notes: "",
      },
    ]);
  };

  const updateItem = (id: string, field: keyof DeliveryItem, val: any) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: val } : item)));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleDownloadPdf = async () => {
    if (!recipientName.trim()) {
      setErrorMessage("Nama penerima barang wajib diisi.");
      return;
    }
    if (items.some((it) => !it.description.trim())) {
      setErrorMessage("Semua deskripsi barang harus diisi.");
      return;
    }

    setErrorMessage("");
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      const payload = {
        orderNumber,
        date,
        poNumber,
        vehicleNumber,
        driverName,
        senderName,
        senderBusinessName,
        senderPhone,
        senderAddress,
        recipientName,
        recipientCompany,
        recipientPhone,
        recipientAddress,
        items,
        notes,
      };

      const res = await fetch("/api/tools/delivery-order-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal membuat PDF Surat Jalan.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SuratJalan_${orderNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setDownloadSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Terjadi kesalahan saat mengunduh PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Top Navbar */}
      <LandingNavbar session={session} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
            <TruckIcon className="w-4 h-4" />
            Format Standar Logistik • 3 Kolom Tanda Tangan • 100% Gratis
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
            Buat Surat Jalan Pengiriman Barang (Delivery Order)
          </h1>
          <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
            Buat dokumen resmi pengiriman barang supplier, ekspedisi, dan toko grosir. Lengkap dengan daftar item, kuantiti, no kendaraan, sopir, dan 3 kolom tanda tangan sah.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-500 hover:text-rose-700">✕</button>
          </div>
        )}

        {/* Success Alert / Viral Lead Magnet */}
        {downloadSuccess && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-ink">Surat Jalan PDF Berhasil Dibuat!</h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Perlu membuat invoice penagihan resmi dengan kalkulasi PPN & QRIS otomatis untuk barang ini?
                </p>
              </div>
            </div>
            <Link
              href="/buat-invoice"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-sm transition"
            >
              Buat Invoice Tagihan
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Editor (Left) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Dokumen & Pengangkutan */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-light shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-border-light pb-3">
                <TruckIcon className="w-4 h-4 text-emerald-600" />
                Informasi Surat Jalan & Kendaraan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    No. Surat Jalan
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="SJ-202608-001"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Tanggal Pengiriman
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    No. Referensi PO (Opsional)
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="PO-982103"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    No. Plat Kendaraan / Ekspedisi
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="B 1234 CD / JNE Cargo"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-ink-soft mb-1">
                    Nama Sopir / Kurir
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="Nama Pengemudi / Petugas Ekspedisi"
                  />
                </div>
              </div>
            </div>

            {/* Pihak Pengirim & Penerima */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pengirim */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-light shadow-sm space-y-3">
                <h2 className="text-xs font-bold text-ink flex items-center gap-1.5 border-b border-border-light pb-2">
                  <BuildingOffice2Icon className="w-3.5 h-3.5 text-emerald-600" />
                  Pengirim / Gudang
                </h2>
                <div>
                  <label className="block text-[10px] font-bold text-ink-soft mb-1">Nama Usaha / PT</label>
                  <input
                    type="text"
                    value={senderBusinessName}
                    onChange={(e) => setSenderBusinessName(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="PT Pengirim Logistik"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink-soft mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Nama Kepala Gudang / PIC"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink-soft mb-1">Alamat Asal</label>
                  <input
                    type="text"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Alamat gudang asal"
                  />
                </div>
              </div>

              {/* Penerima */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-light shadow-sm space-y-3">
                <h2 className="text-xs font-bold text-ink flex items-center gap-1.5 border-b border-border-light pb-2">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  Tujuan Pengiriman (Penerima)
                </h2>
                <div>
                  <label className="block text-[10px] font-bold text-ink-soft mb-1">Nama Penerima <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    placeholder="Nama PIC Penerima"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink-soft mb-1">Perusahaan / Toko</label>
                  <input
                    type="text"
                    value={recipientCompany}
                    onChange={(e) => setRecipientCompany(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Nama Toko Cabang"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-ink-soft mb-1">Alamat Tujuan</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full text-xs bg-paper border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Alamat lengkap penerima barang"
                  />
                </div>
              </div>
            </div>

            {/* Daftar Barang */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border-light shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-light pb-3">
                <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-600" />
                  Daftar Barang yang Dikirim
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Tambah Barang
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-paper border border-border-light space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-ink-soft">
                        Barang #{idx + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded transition"
                          title="Hapus Barang"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-6">
                        <label className="block text-[10px] font-bold text-ink-soft mb-0.5">Nama & Spesifikasi Barang</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          className="w-full text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                          placeholder="Nama barang..."
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-[10px] font-bold text-ink-soft mb-0.5">Jumlah (Qty)</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Math.max(1, Number(e.target.value) || 1))}
                          className="w-full text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none font-bold"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-[10px] font-bold text-ink-soft mb-0.5">Satuan</label>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                          className="w-full text-xs bg-surface border border-border rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                          placeholder="Pcs / Dus / Sak"
                        />
                      </div>
                      <div className="col-span-12">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                          className="w-full text-[11px] bg-surface border border-border rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-emerald-500 outline-none text-ink-soft"
                          placeholder="Keterangan tambahan (cth: Segel utuh, fragile, warna merah)..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink-soft mb-1">
                  Catatan / Instruksi Pengiriman
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-paper border border-border rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Sedang Merender Surat Jalan PDF...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download Surat Jalan PDF
                </>
              )}
            </button>
          </div>

          {/* Live Preview (Right) */}
          <div className="lg:col-span-6 sticky top-20">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-300 shadow-xl text-slate-800">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-4 mb-4">
                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    {senderBusinessName || senderName || "Nama Perusahaan Pengirim"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{senderAddress}</div>
                  {senderPhone && <div className="text-[11px] text-slate-500">Telp: {senderPhone}</div>}
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-black text-emerald-800 tracking-wider">
                    SURAT JALAN
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">No: {orderNumber}</div>
                  <div className="text-[11px] text-slate-600">Tgl: {date}</div>
                  {poNumber && <div className="text-[10px] text-slate-500">Ref PO: {poNumber}</div>}
                </div>
              </div>

              {/* Penerima Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 flex flex-col sm:flex-row justify-between gap-2 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Tujuan Pengiriman:</div>
                  <div className="font-bold text-slate-900">{recipientName} {recipientCompany ? `(${recipientCompany})` : ""}</div>
                  <div className="text-[11px] text-slate-600">{recipientAddress}</div>
                  {recipientPhone && <div className="text-[10px] text-slate-500">Kontak: {recipientPhone}</div>}
                </div>
                {(driverName || vehicleNumber) && (
                  <div className="sm:text-right sm:border-l sm:pl-3 border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Pengangkutan:</div>
                    {driverName && <div className="text-[11px] text-slate-700">Kurir: <span className="font-semibold">{driverName}</span></div>}
                    {vehicleNumber && <div className="text-[11px] text-slate-700">No. Pol: <span className="font-semibold">{vehicleNumber}</span></div>}
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-700 text-white font-bold text-[10px] uppercase">
                      <th className="py-2 px-2.5 text-center w-8">No</th>
                      <th className="py-2 px-2.5">Nama Barang / Deskripsi</th>
                      <th className="py-2 px-2.5 text-center w-16">Qty</th>
                      <th className="py-2 px-2.5 text-center w-16">Satuan</th>
                      <th className="py-2 px-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 1 ? "bg-slate-50/50" : ""}>
                        <td className="py-2 px-2.5 text-center text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-2.5 font-medium text-slate-900">{item.description || "(Nama Barang)"}</td>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-900">{item.quantity}</td>
                        <td className="py-2 px-2.5 text-center text-slate-600">{item.unit || "Pcs"}</td>
                        <td className="py-2 px-2.5 text-[11px] text-slate-500">{item.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {notes && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 mb-6 text-[11px] text-amber-900">
                  <span className="font-bold">Catatan:</span> {notes}
                </div>
              )}

              {/* 3 Tanda Tangan */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2">
                <div>
                  <div className="font-bold text-slate-700 uppercase mb-8">Pengirim</div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                    ( {senderName || "................"} )
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-700 uppercase mb-8">Sopir / Kurir</div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                    ( {driverName || "................"} )
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-700 uppercase mb-8">Penerima</div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                    ( {recipientName || "................"} )
                  </div>
                </div>
              </div>

              {/* Watermark Footer */}
              <div className="mt-8 pt-3 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
                Dokumen Pengiriman Resmi • Diterbitkan secara digital via NotaKu.store
              </div>
            </div>

            {/* Quick FAQ */}
            <div className="mt-8 p-5 rounded-2xl bg-surface border border-border-light space-y-3">
              <h2 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                Panduan & Pertanyaan Umum Surat Jalan
              </h2>

              <details className="text-xs group">
                <summary className="cursor-pointer font-bold text-ink-soft hover:text-ink py-1">
                  Mengapa nominal harga tidak dicantumkan di Surat Jalan?
                </summary>
                <p className="mt-1 text-ink-soft pl-3 border-l-2 border-emerald-500 leading-relaxed">
                  Surat Jalan adalah dokumen operasional logistik untuk memverifikasi fisik barang dan kuantiti yang dibawa kurir/ekspedisi. Informasi nominal harga merupakan data finansial yang secara resmi dicantumkan pada <strong>Invoice / Faktur Tagihan</strong>.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Cross-linking Free Tools Navigation */}
        <FreeToolsNav />
      </main>
    </div>
  );
}

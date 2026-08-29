/**
 * Helper konversi angka nominal ke kalimat terbilang Bahasa Indonesia
 * Contoh:
 * 1500000 -> "Satu Juta Lima Ratus Ribu Rupiah"
 * 25000 -> "Dua Puluh Lima Ribu Rupiah"
 */

const SATUAN = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];

function konversiAngka(nominal: number): string {
  const n = Math.floor(Math.abs(nominal));

  if (n < 12) {
    return SATUAN[n];
  }
  if (n < 20) {
    return `${konversiAngka(n - 10)} Belas`;
  }
  if (n < 100) {
    const sisa = n % 10;
    return `${konversiAngka(Math.floor(n / 10))} Puluh${sisa > 0 ? ` ${konversiAngka(sisa)}` : ""}`;
  }
  if (n < 200) {
    const sisa = n - 100;
    return `Seratus${sisa > 0 ? ` ${konversiAngka(sisa)}` : ""}`;
  }
  if (n < 1000) {
    const sisa = n % 100;
    return `${konversiAngka(Math.floor(n / 100))} Ratus${sisa > 0 ? ` ${konversiAngka(sisa)}` : ""}`;
  }
  if (n < 2000) {
    const sisa = n - 1000;
    return `Seribu${sisa > 0 ? ` ${konversiAngka(sisa)}` : ""}`;
  }
  if (n < 1000000) {
    const sisa = n % 1000;
    return `${konversiAngka(Math.floor(n / 1000))} Ribu${sisa > 0 ? ` ${konversiAngka(sisa)}` : ""}`;
  }
  if (n < 1000000000) {
    const sisa = n % 1000000;
    return `${konversiAngka(Math.floor(n / 1000000))} Juta${sisa > 0 ? ` ${konversiAngka(sisa)}` : ""}`;
  }
  if (n < 1000000000000) {
    const sisa = n % 1000000000;
    return `${konversiAngka(Math.floor(n / 1000000000))} Miliar${sisa > 0 ? ` ${konversiAngka(sisa)}` : ""}`;
  }
  if (n < 1000000000000000) {
    const sisa = n % 1000000000000;
    return `${konversiAngka(Math.floor(n / 1000000000000))} Triliun${sisa > 0 ? ` ${konversiAngka(sisa)}` : ""}`;
  }

  return n.toString();
}

/**
 * Mengubah angka menjadi kalimat terbilang murni
 */
export function terbilang(nominal: number): string {
  const n = Math.floor(Math.abs(nominal));
  if (n === 0) return "Nol";
  return konversiAngka(n).trim().replace(/\s+/g, " ");
}

/**
 * Mengubah angka menjadi kalimat terbilang berakhiran "Rupiah"
 * Contoh: terbilangRupiah(1500000) => "Satu Juta Lima Ratus Ribu Rupiah"
 */
export function terbilangRupiah(nominal: number): string {
  const text = terbilang(nominal);
  if (text === "Nol") return "Nol Rupiah";
  return `${text} Rupiah`;
}

/**
 * Helper utilitas sanitasi CSV untuk mencegah CSV Formula Injection (CWE-1236).
 * Jika isi sel dimulai dengan karakter formula Excel/Calc/Sheets (=, +, -, @, |, \t, \r, \n),
 * baik secara langsung maupun setelah whitespace / control characters / Unicode BOM,
 * karakter tersebut di-escape dengan prefix tanda petik tunggal (') agar dievaluasi
 * sebagai teks literal dan tidak mengeksekusi rumus atau command berbahaya.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Strip leading whitespace, invisible control characters, dan Unicode markers (BOM, Zero-Width Space)
  // untuk mendeteksi apakah payload diawali dengan pemicu formula tersembunyi
  const trimmed = str.replace(/^[\s\u0000-\u001F\u007F-\u009F​﻿]+/, "");
  const dangerousPrefixes = ["=", "+", "-", "@", "|", "\t", "\r", "\n"];

  if (
    dangerousPrefixes.some((p) => str.startsWith(p)) ||
    (trimmed.length > 0 && dangerousPrefixes.some((p) => trimmed.startsWith(p)))
  ) {
    str = `'${str}`;
  }

  // Escape tanda kutip ganda internal (" -> "")
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

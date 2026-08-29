import { promises as dns } from "dns";

export const CNAME_TARGET = process.env.NEXT_PUBLIC_CNAME_TARGET || "cname.notaku.store";

/**
 * Bersihkan string hostname dari http://, https://, port, dan path
 */
export function sanitizeDomain(raw: string): string {
  let domain = raw.trim().toLowerCase();
  // Hapus protokol
  domain = domain.replace(/^https?:\/\//i, "");
  // Hapus trailing slash dan path
  domain = domain.split("/")[0];
  // Hapus port jika ada
  domain = domain.split(":")[0];
  return domain;
}

/**
 * Generate token TXT verifikasi unik
 */
export function generateDomainVerificationToken(userId: string): string {
  const hash = Math.random().toString(36).substring(2, 10);
  return `notaku-verify-${userId.slice(-6)}-${hash}`;
}

export interface DnsCheckResult {
  verified: boolean;
  cnameMatched: boolean;
  txtMatched: boolean;
  cnameRecords: string[];
  txtRecords: string[];
  message: string;
}

/**
 * Verifikasi konfigurasi DNS domain (Mengecek CNAME dan/atau TXT record)
 */
export async function verifyDomainDns(
  domain: string,
  expectedTxtToken?: string | null
): Promise<DnsCheckResult> {
  const cleanDomain = sanitizeDomain(domain);
  const result: DnsCheckResult = {
    verified: false,
    cnameMatched: false,
    txtMatched: false,
    cnameRecords: [],
    txtRecords: [],
    message: "",
  };

  // 1. Cek CNAME Record
  try {
    const cnames = await dns.resolveCname(cleanDomain);
    result.cnameRecords = cnames;
    const targetClean = CNAME_TARGET.toLowerCase();
    result.cnameMatched = cnames.some((record) => {
      const rec = record.toLowerCase().replace(/\.$/, "");
      return rec === targetClean || rec.endsWith("notaku.store") || rec.endsWith("vercel-dns.com");
    });
  } catch (err: any) {
    // DNS error atau record CNAME tidak ada
  }

  // 2. Cek TXT Record jika ada token
  if (expectedTxtToken) {
    try {
      const txtChunks = await dns.resolveTxt(cleanDomain);
      const flattenedTxt = txtChunks.flat();
      result.txtRecords = flattenedTxt;
      result.txtMatched = flattenedTxt.some((rec) => rec.includes(expectedTxtToken));
    } catch (err: any) {
      // TXT tidak ditemukan
    }
  }

  if (result.cnameMatched || result.txtMatched) {
    result.verified = true;
    result.message = "Domain berhasil diverifikasi dan terhubung ke sistem NotaKu.";
  } else {
    result.verified = false;
    result.message = `DNS belum terdeteksi. Pastikan Anda telah membuat CNAME record mengarah ke '${CNAME_TARGET}' atau TXT record sesuai panduan.`;
  }

  return result;
}

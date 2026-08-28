import { prisma } from "./prisma";

export type PromoValidationResult =
  | {
      valid: true;
      code: string;
      description: string;
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      originalPrice: number;
      discountAmount: number;
      finalPrice: number;
    }
  | {
      valid: false;
      error: string;
    };

export const BASE_PRO_PRICE = 49000;

/**
 * Validasi dan hitung potongan harga promo voucher untuk Paket PRO
 */
export async function validatePromoCode(
  rawCode: string,
  basePrice: number = BASE_PRO_PRICE
): Promise<PromoValidationResult> {
  if (!rawCode || !rawCode.trim()) {
    return { valid: false, error: "Kode voucher tidak boleh kosong" };
  }

  const code = rawCode.trim().toUpperCase();

  try {
    // Ambil log pembuatan / pembaruan promo terakhir dari database
    const logs = await prisma.auditLog.findMany({
      where: { event: "admin.promo_saved" },
      orderBy: { createdAt: "desc" },
    });

    let matchedPromo: {
      code: string;
      description: string;
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      maxUses: number | null;
      expiresAt: string | null;
      isActive: boolean;
    } | null = null;

    for (const log of logs) {
      if (!log.detail) continue;
      const d = log.detail as Record<string, any>;
      if ((d.code || "").toUpperCase() === code) {
        matchedPromo = {
          code,
          description: d.description || "",
          discountType: d.discountType || "PERCENTAGE",
          discountValue: Number(d.discountValue || 0),
          maxUses: d.maxUses ? Number(d.maxUses) : null,
          expiresAt: d.expiresAt || null,
          isActive: d.isActive ?? true,
        };
        break; // Ambil konfigurasi terbaru
      }
    }

    if (!matchedPromo) {
      return { valid: false, error: "Kode voucher tidak ditemukan atau tidak valid" };
    }

    if (!matchedPromo.isActive) {
      return { valid: false, error: "Kode voucher ini sudah dinonaktifkan" };
    }

    if (matchedPromo.expiresAt) {
      const expiry = new Date(matchedPromo.expiresAt);
      // Set batas akhir hari tanggal kadaluwarsa (23:59:59)
      expiry.setHours(23, 59, 59, 999);
      if (new Date() > expiry) {
        return { valid: false, error: "Masa berlaku kode voucher ini telah berakhir" };
      }
    }

    // Cek batas kuota klaim jika disetel
    if (matchedPromo.maxUses && matchedPromo.maxUses > 0) {
      const usageCount = await prisma.auditLog.count({
        where: {
          event: "payment.mayar_settlement",
          detail: {
            path: ["promoCode"],
            equals: code,
          },
        },
      });

      if (usageCount >= matchedPromo.maxUses) {
        return { valid: false, error: "Kuota penggunaan kode voucher ini telah habis" };
      }
    }

    // Kalkulasi diskon
    let discountAmount = 0;
    if (matchedPromo.discountType === "PERCENTAGE") {
      const percent = Math.min(Math.max(matchedPromo.discountValue, 0), 100);
      discountAmount = Math.round((basePrice * percent) / 100);
    } else {
      discountAmount = Math.min(Math.round(matchedPromo.discountValue), basePrice);
    }

    // Minimal pembayaran Mayar adalah Rp 1.000
    const finalPrice = Math.max(1000, basePrice - discountAmount);

    return {
      valid: true,
      code: matchedPromo.code,
      description: matchedPromo.description,
      discountType: matchedPromo.discountType,
      discountValue: matchedPromo.discountValue,
      originalPrice: basePrice,
      discountAmount,
      finalPrice,
    };
  } catch (err) {
    console.error("[PROMO_VALIDATION_ERROR]", err);
    return { valid: false, error: "Terjadi kesalahan saat memvalidasi voucher" };
  }
}

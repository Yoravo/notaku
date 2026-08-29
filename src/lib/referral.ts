import { prisma } from "./prisma";

export const REFERRAL_BONUS_AMOUNT = 10000; // Rp 10.000 saldo per referral yang upgrade PRO

/**
 * Generate kode referral alfanumerik unik (contoh: NOTA-7X9K)
 */
export function generateRandomReferralCode(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Hindari karakter membingungkan (0, O, 1, I)
  let result = "NK-";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Pastikan user memiliki referral code, generate jika belum ada
 */
export async function ensureUserReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, name: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  // Generate kode unik dan pastikan belum dipakai
  let uniqueCode = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    uniqueCode = generateRandomReferralCode(6);
    const existing = await prisma.user.findUnique({
      where: { referralCode: uniqueCode },
      select: { id: true },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    uniqueCode = `NK-${userId.slice(-6).toUpperCase()}`;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: uniqueCode },
  });

  return uniqueCode;
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { ensureUserReferralCode, REFERRAL_BONUS_AMOUNT } from "@/lib/referral";
import { revalidatePath } from "next/cache";

export interface ReferralFriend {
  id: string;
  name: string;
  email: string;
  plan: "FREE" | "PRO";
  createdAt: string;
  rewardEarned: number;
}

export interface ReferralStats {
  referralCode: string;
  referralUrl: string;
  totalFriends: number;
  proFriends: number;
  totalEarnings: number;
  availableBalance: number;
  bonusPerPro: number;
  friends: ReferralFriend[];
}

/**
 * Mengambil ringkasan statistik referral user yang sedang login
 */
export async function getReferralStats(): Promise<ReferralStats | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userId = session.user.id;
  const referralCode = await ensureUserReferralCode(userId);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://www.notaku.store";
  const referralUrl = `${baseUrl}/register?ref=${referralCode}`;

  const [user, referrals, rewards] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    }),
    prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.referralReward.findMany({
      where: { referrerId: userId },
      select: {
        referredUserId: true,
        amount: true,
        status: true,
      },
    }),
  ]);

  const totalEarnings = rewards
    .filter((r) => r.status === "COMPLETED")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const rewardMap = new Map<string, number>();
  rewards.forEach((r) => {
    if (r.status === "COMPLETED") {
      rewardMap.set(r.referredUserId, Number(r.amount));
    }
  });

  const proFriends = referrals.filter((f) => f.plan === "PRO").length;

  const friends: ReferralFriend[] = referrals.map((f) => {
    // Sensor sebagian nama dan email demi privasi
    const rawEmail = f.email;
    const atIdx = rawEmail.indexOf("@");
    let maskedEmail = rawEmail;
    if (atIdx > 2) {
      maskedEmail = `${rawEmail.slice(0, 2)}***${rawEmail.slice(atIdx)}`;
    }

    return {
      id: f.id,
      name: f.name,
      email: maskedEmail,
      plan: f.plan as "FREE" | "PRO",
      createdAt: f.createdAt.toISOString(),
      rewardEarned: rewardMap.get(f.id) || 0,
    };
  });

  return {
    referralCode,
    referralUrl,
    totalFriends: referrals.length,
    proFriends,
    totalEarnings,
    availableBalance: Number(user?.balance || 0),
    bonusPerPro: REFERRAL_BONUS_AMOUNT,
    friends,
  };
}

/**
 * Kaitkan referrer ke user baru berdasarkan referralCode
 */
export async function linkUserReferral(userId: string, rawCode: string) {
  if (!rawCode || !rawCode.trim()) return { success: false, error: "Kode referral kosong" };

  const code = rawCode.trim().toUpperCase();

  try {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!referrer) {
      return { success: false, error: "Kode referral tidak ditemukan" };
    }

    if (referrer.id === userId) {
      return { success: false, error: "Tidak dapat menggunakan kode referral sendiri" };
    }

    // Pastikan user belum terikat ke referrer lain
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredById: true },
    });

    if (currentUser?.referredById) {
      return { success: false, error: "Akun sudah terhubung ke referral lain" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { referredById: referrer.id },
    });

    revalidatePath("/referrals");
    return { success: true };
  } catch (err) {
    console.error("Gagal mengaitkan referral:", err);
    return { success: false, error: "Gagal menghubungkan referral" };
  }
}

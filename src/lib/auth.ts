import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { escapeHtml } from "./html";
import { ensureUserReferralCode } from "./referral";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      referralCode: {
        type: "string",
        required: false,
      },
      referredById: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Otomatis buatkan referralCode jika user baru dibuat
          try {
            await ensureUserReferralCode(user.id);
          } catch (e) {
            console.error("Gagal auto-generate referralCode:", e);
          }
        },
      },
    },
  },
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.notaku.store",
  trustedOrigins: [
    "https://www.notaku.store",
    "https://notaku.store",
    "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPassword: {
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: { name?: string | null; email: string };
        url: string;
      }) => {
        void sendEmail({
          to: user.email,
          subject: "Reset kata sandi akun NotaKu kamu",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">Nota<span style="color: #0f6b4f;">Ku</span></h1>
              </div>
              <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 0;">Permintaan Reset Kata Sandi</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">Halo <strong>${escapeHtml(user.name || "Pengguna NotaKu")}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">Kami menerima permintaan untuk mereset kata sandi akun NotaKu Anda (${escapeHtml(user.email)}). Klik tombol di bawah ini untuk membuat kata sandi baru:</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${url}" style="display: inline-block; background: #0f6b4f; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 4px rgba(15, 107, 79, 0.2);">Reset Kata Sandi</a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">Tautan ini hanya berlaku untuk waktu terbatas demi keamanan akun Anda. Jika tombol di atas tidak dapat diklik, salin tautan berikut ke browser:</p>
              <p style="font-size: 11px; color: #0f6b4f; word-break: break-all; background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">${url}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;" />
              <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0; text-align: center;">Jika Anda tidak pernah meminta reset kata sandi, abaikan email ini dengan aman. Kata sandi Anda tidak akan berubah.</p>
            </div>
          `,
        });
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { name?: string | null; email: string };
      url: string;
    }) => {
      void sendEmail({
        to: user.email,
        subject: "Verifikasi email NotaKu kamu",
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">Nota<span style="color: #0f6b4f;">Ku</span></h1>
              </div>
              <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 0;">Verifikasi email kamu</h2>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">Halo <strong>${escapeHtml(user.name || "Pengguna NotaKu")}</strong>, klik tombol di bawah untuk memverifikasi email dan mengaktifkan akun NotaKu kamu.</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${url}" style="display: inline-block; background: #0f6b4f; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 4px rgba(15, 107, 79, 0.2);">Verifikasi Email</a>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">Jika kamu tidak mendaftar di NotaKu, abaikan email ini.</p>
            </div>
          `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [nextCookies()],
});

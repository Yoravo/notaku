import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { escapeHtml } from "./html";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verifikasi email NotaKu kamu",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #1b1916;">Verifikasi email kamu</h2>
              <p style="color: #6b6459;">Halo ${escapeHtml(user.name)}, klik tombol di bawah untuk memverifikasi email dan
  mengaktifkan akun NotaKu kamu.</p>
              <a href="${url}" style="display: inline-block; background: #0f6b4f; color: #fff; padding: 12px 24px;
  border-radius: 8px; text-decoration: none; margin-top: 16px;">Verifikasi Email</a>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">Jika kamu tidak mendaftar di NotaKu, abaikan
  email ini.</p>
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

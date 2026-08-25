import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || "NotaKu <onboarding@resend.dev>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (result.error) {
    throw new Error(result.error.message || "Gagal mengirim email via Resend");
  }

  return result.data;
}

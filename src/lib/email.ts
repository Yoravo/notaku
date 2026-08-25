import { Resend } from "resend";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY belum dikonfigurasi di environment.");
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM || "NotaKu <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (result.error) {
      throw new Error(result.error.message || "Gagal mengirim email via Resend");
    }

    return result.data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal terhubung ke layanan Resend";
    throw new Error(msg);
  }
}

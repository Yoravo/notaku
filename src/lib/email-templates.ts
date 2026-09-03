import { escapeHtml } from "./html";

export type InvoiceEmailTemplateProps = {
  invoiceNumber: string;
  customerName: string;
  businessName: string;
  subtotal?: number;
  discountAmount?: number;
  discountType?: string;
  discountValue?: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  dueDate: string | null;
  publicId: string;
  invoiceUrl: string;
  type?: "new" | "reminder" | "paid";
  customMessage?: string;
  items?: {
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }[];
};

export function renderInvoiceEmailHtml({
  invoiceNumber,
  customerName,
  businessName,
  subtotal,
  discountAmount = 0,
  discountType = "FIXED",
  discountValue = 0,
  taxRate = 0,
  taxAmount = 0,
  total,
  dueDate,
  invoiceUrl,
  type = "new",
  customMessage,
  items = [],
}: InvoiceEmailTemplateProps): string {
  const safeInvoiceNumber = escapeHtml(invoiceNumber || "Draft");
  const safeCustomerName = escapeHtml(customerName || "Pelanggan");
  const safeBusinessName = escapeHtml(businessName || "NotaKu");
  const safeInvoiceUrl = encodeURI(invoiceUrl);
  const safeCustomMessage = customMessage ? escapeHtml(customMessage) : "";

  const formattedTotal = `Rp${Number(total).toLocaleString("id-ID")}`;
  const computedSubtotal = subtotal ? Number(subtotal) : Number(total);

  const typeConfig = {
    new: {
      badge: "Tagihan Baru",
      badgeColor: "#0f6b4f",
      badgeBg: "#e6f4ea",
      headline: "Faktur Tagihan Baru",
      subheadline: `Halo ${safeCustomerName}, tagihan baru telah diterbitkan oleh <strong>${safeBusinessName}</strong>.`,
      actionText: "Lihat & Bayar Tagihan",
      buttonColor: "#0f6b4f",
    },
    reminder: {
      badge: "Pengingat Pembayaran",
      badgeColor: "#b45309",
      badgeBg: "#fef3c7",
      headline: "Pengingat Jatuh Tempo Tagihan",
      subheadline: `Halo ${safeCustomerName}, ini adalah pengingat ramah mengenai tagihan Anda dari <strong>${safeBusinessName}</strong>.`,
      actionText: "Buka Faktur Sekarang",
      buttonColor: "#d97706",
    },
    paid: {
      badge: "Pembayaran Lunas",
      badgeColor: "#15803d",
      badgeBg: "#dcfce7",
      headline: "Bukti Pembayaran Lunas",
      subheadline: `Halo ${safeCustomerName}, terima kasih! Pembayaran tagihan Anda kepada <strong>${safeBusinessName}</strong> telah diterima.`,
      actionText: "Lihat Bukti Transaksi",
      buttonColor: "#16a34a",
    },
  }[type];

  const itemsHtml = items.length > 0
    ? `
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 20px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: left;">
            <th style="padding: 8px 12px; font-weight: 600;">Deskripsi</th>
            <th style="padding: 8px 12px; font-weight: 600; text-align: center; width: 60px;">Qty</th>
            <th style="padding: 8px 12px; font-weight: 600; text-align: right;">Harga</th>
            <th style="padding: 8px 12px; font-weight: 600; text-align: right;">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #f1f5f9; color: #1e293b;">
              <td style="padding: 10px 12px;">${escapeHtml(item.description)}</td>
              <td style="padding: 10px 12px; text-align: center; color: #64748b;">${Number(item.quantity)}</td>
              <td style="padding: 10px 12px; text-align: right; color: #64748b;">Rp${Number(item.price).toLocaleString("id-ID")}</td>
              <td style="padding: 10px 12px; text-align: right; font-weight: 500;">Rp${Number(item.amount).toLocaleString("id-ID")}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `
    : "";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${safeInvoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e5e7eb;">

          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #f1f5f9; text-align: left;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a;">
                      Nota<span style="color: #0f6b4f;">Ku</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 12px; background-color: ${typeConfig.badgeBg}; color: ${typeConfig.badgeColor}; font-size: 12px; font-weight: 600; border-radius: 9999px;">
                      ${typeConfig.badge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                ${typeConfig.headline}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                ${typeConfig.subheadline}
              </p>

              ${
                safeCustomMessage
                  ? `
                <div style="margin-bottom: 24px; padding: 14px 16px; background-color: #f8fafc; border-left: 4px solid #0f6b4f; border-radius: 4px; font-size: 13px; line-height: 1.5; color: #334155; white-space: pre-line;">
                  ${safeCustomMessage}
                </div>
              `
                  : ""
              }

              <!-- Invoice Summary Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Nomor Faktur</td>
                        <td align="right" style="padding-bottom: 8px; font-size: 13px; font-weight: 600; color: #1e293b;">${safeInvoiceNumber}</td>
                      </tr>
                      ${
                        dueDate
                          ? `
                      <tr>
                        <td style="padding-bottom: 8px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Jatuh Tempo</td>
                        <td align="right" style="padding-bottom: 8px; font-size: 13px; font-weight: 600; color: #e11d48;">${escapeHtml(dueDate)}</td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        discountAmount > 0 || taxAmount > 0
                          ? `
                      <tr>
                        <td style="padding-top: 6px; padding-bottom: 6px; font-size: 12px; color: #64748b;">Subtotal</td>
                        <td align="right" style="padding-top: 6px; padding-bottom: 6px; font-size: 13px; font-weight: 600; color: #334155;">Rp${computedSubtotal.toLocaleString("id-ID")}</td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        discountAmount > 0
                          ? `
                      <tr>
                        <td style="padding-bottom: 6px; font-size: 12px; color: #0f6b4f; font-weight: 600;">Diskon ${discountType === "PERCENTAGE" ? `(${Number(discountValue)}%)` : ""}</td>
                        <td align="right" style="padding-bottom: 6px; font-size: 13px; font-weight: 600; color: #0f6b4f;">-Rp${Number(discountAmount).toLocaleString("id-ID")}</td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        taxAmount > 0
                          ? `
                      <tr>
                        <td style="padding-bottom: 6px; font-size: 12px; color: #64748b;">Pajak (PPN ${Number(taxRate)}%)</td>
                        <td align="right" style="padding-bottom: 6px; font-size: 13px; font-weight: 600; color: #334155;">+Rp${Number(taxAmount).toLocaleString("id-ID")}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 14px; font-weight: 700; color: #0f172a;">Total Tagihan</td>
                        <td align="right" style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 18px; font-weight: 800; color: #0f6b4f;">${formattedTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Invoice Items Table -->
              ${itemsHtml}

              <!-- Call to Action Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 8px; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${safeInvoiceUrl}" target="_blank" style="display: inline-block; background-color: ${typeConfig.buttonColor}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      ${typeConfig.actionText} →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                Jika tombol di atas tidak dapat diklik, salin dan buka tautan berikut di browser:<br>
                <a href="${safeInvoiceUrl}" style="color: #0f6b4f; text-decoration: underline; word-break: break-all;">${safeInvoiceUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Email ini dikirim otomatis oleh sistem <a href="https://notaku.store" style="color: #0f6b4f; font-weight: 600; text-decoration: none;">NotaKu</a> atas nama <strong>${safeBusinessName}</strong>.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} NotaKu &bull; Simple & Fast Invoicing
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export type BroadcastEmailTemplateProps = {
  subject: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  content: string; // Markdown or HTML string
  ctaText?: string;
  ctaUrl?: string;
};

export function renderBroadcastEmailHtml({
  subject,
  badge = "Pengumuman Resmi",
  badgeBg = "#ecfdf5",
  badgeColor = "#0f6b4f",
  content,
  ctaText,
  ctaUrl,
}: BroadcastEmailTemplateProps): string {
  // Ubah line-breaks menjadi <p> atau <br> jika format plain text
  const safeContent = content
    .split("\n\n")
    .map((paragraph) => `<p style="margin: 0 0 16px 0; line-height: 1.6;">${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const safeCtaText = ctaText ? escapeHtml(ctaText) : "Buka NotaKu";
  const safeCtaUrl = ctaUrl ? encodeURI(ctaUrl) : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">

          <!-- Header Branding -->
          <tr>
            <td style="padding: 28px 32px; background-color: #0f172a; text-align: center;">
              <a href="https://notaku.store" style="text-decoration: none;">
                <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Nota<span style="color: #34d399;">Ku</span></span>
              </a>
              <div style="margin-top: 8px;">
                <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${badge}
                </span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                ${escapeHtml(subject)}
              </h1>

              <div style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                ${safeContent}
              </div>

              ${
                safeCtaUrl
                  ? `
              <!-- CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 28px; margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${safeCtaUrl}" target="_blank" style="display: inline-block; background-color: #0f6b4f; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(15, 107, 79, 0.2);">
                      ${safeCtaText} →
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; line-height: 1.5;">
                <p style="margin: 0;">
                  Salam hangat,<br>
                  <strong>Tim NotaKu Indonesia</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                Anda menerima email ini karena terdaftar sebagai pengguna resmi di <a href="https://notaku.store" style="color: #0f6b4f; text-decoration: none; font-weight: 600;">NotaKu</a>.<br>
                Kelola preferensi notifikasi di <a href="https://notaku.store/settings" style="color: #0f6b4f; text-decoration: underline;">Pengaturan Akun</a>.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} NotaKu &bull; Simple & Fast Invoicing
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

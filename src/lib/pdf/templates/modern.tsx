import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { InvoiceData } from "../types";
import { statusText } from "../types";
import { formatCurrency } from "@/lib/pdf/format";

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 10, fontFamily: "Helvetica" },
  header: { backgroundColor: "#1b1916", padding: 40, paddingBottom: 32 },
  logoWrapper: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  logo: {
    height: 42,
    objectFit: "contain",
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 3,
  },
  headerNumber: { fontSize: 10, color: "#9ca3af", marginTop: 4 },
  headerBusiness: { width: 220, alignItems: "flex-end" },
  headerBusinessName: {
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    fontSize: 12,
  },
  headerBusinessDetail: { color: "#9ca3af", marginTop: 2 },
  statusBadge: { marginTop: 8, alignSelf: "flex-start" },
  body: { padding: 40 },
  label: {
    fontSize: 8,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  text: { color: "#333", lineHeight: 1.5 },
  section: { marginBottom: 20 },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 20,
  },
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colDesc: { flex: 1 },
  colQty: { width: 40, textAlign: "right" },
  colPrice: { width: 90, textAlign: "right" },
  colAmount: { width: 90, textAlign: "right" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 3,
  },
  summaryLabel: {
    width: 140,
    textAlign: "right",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#6b7280",
  },
  summaryValue: {
    width: 90,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#111827",
  },
  totalBox: {
    marginTop: 10,
    backgroundColor: "#1b1916",
    borderRadius: 6,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#9ca3af",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  totalValue: { color: "#ffffff", fontSize: 16, fontFamily: "Helvetica-Bold" },
  signatureContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBox: {
    width: 170,
    alignItems: "center",
    textAlign: "center",
  },
  signatureImageWrapper: {
    height: 55,
    width: "100%",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  signatureImg: {
    maxHeight: 50,
    maxWidth: 130,
    objectFit: "contain",
  },
  stampImg: {
    position: "absolute",
    height: 55,
    width: 55,
    right: 15,
    top: -2,
    opacity: 0.85,
    objectFit: "contain",
  },
  signatureName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#222",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 4,
    width: "100%",
    textAlign: "center",
  },
  signatureTitle: {
    fontSize: 8,
    color: "#666",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#aaa",
  },
});

export function ModernTemplate({ data }: { data: InvoiceData }) {
  const status = statusText[data.status] || data.status;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Dark Header */}
        <View style={styles.header}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View>
              <Text style={styles.headerTitle}>INVOICE</Text>
              <Text style={styles.headerNumber}>{data.number}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: "#374151",
                    borderRadius: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#d1d5db",
                    fontFamily: "Helvetica-Bold",
                  }}
                >
                  {status}
                </Text>
              </View>
            </View>
            <View style={styles.headerBusiness}>
              {data.user.logoUrl && (
                <View style={styles.logoWrapper}>
                  <Image src={data.user.logoUrl} style={styles.logo} />
                </View>
              )}
              <Text style={[styles.headerBusinessName, { textAlign: "right", width: "100%" }]}>
                {data.user.businessName || data.user.name}
              </Text>
              {data.user.email && (
                <Text style={[styles.headerBusinessDetail, { textAlign: "right", width: "100%" }]}>
                  {data.user.email}
                </Text>
              )}
              {data.user.phone && (
                <Text style={[styles.headerBusinessDetail, { textAlign: "right", width: "100%" }]}>
                  {data.user.phone}
                </Text>
              )}
              {data.user.address && (
                <Text style={[styles.headerBusinessDetail, { marginTop: 4, textAlign: "right", width: "100%" }]}>
                  {data.user.address}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Customer & Dates */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.section}>
              <Text style={styles.label}>Ditagihkan kepada</Text>
              <Text style={[styles.bold, { fontSize: 12 }]}>
                {data.customer.name}
              </Text>
              {data.customer.email && (
                <Text style={styles.text}>{data.customer.email}</Text>
              )}
              {data.customer.phone && (
                <Text style={styles.text}>{data.customer.phone}</Text>
              )}
              {data.customer.address && (
                <Text style={styles.text}>{data.customer.address}</Text>
              )}
            </View>
            <View style={{ ...styles.section, textAlign: "right" }}>
              <Text style={styles.label}>Tanggal dibuat</Text>
              <Text style={styles.text}>{data.createdAt}</Text>
              {data.dueDate && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Jatuh tempo</Text>
                  <Text style={styles.text}>{data.dueDate}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={{ ...styles.colDesc, ...styles.bold, color: "#374151" }}
              >
                Deskripsi
              </Text>
              <Text
                style={{ ...styles.colQty, ...styles.bold, color: "#374151" }}
              >
                Qty
              </Text>
              <Text
                style={{ ...styles.colPrice, ...styles.bold, color: "#374151" }}
              >
                Harga
              </Text>
              <Text
                style={{
                  ...styles.colAmount,
                  ...styles.bold,
                  color: "#374151",
                }}
              >
                Jumlah
              </Text>
            </View>
            {data.items.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={{ ...styles.colDesc, color: "#111" }}>
                  {item.description}
                </Text>
                <Text style={{ ...styles.colQty, color: "#555" }}>
                  {item.quantity}
                </Text>
                <Text style={{ ...styles.colPrice, color: "#555" }}>
                  {formatCurrency(item.price, data.currency)}
                </Text>
                <Text
                  style={{ ...styles.colAmount, ...styles.bold, color: "#111" }}
                >
                  {formatCurrency(item.amount, data.currency)}
                </Text>
              </View>
            ))}
          </View>

          {/* Summary Breakdown */}
          <View style={{ marginTop: 10 }}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(data.subtotal || data.total, data.currency)}
              </Text>
            </View>

            {Boolean(data.discountAmount && data.discountAmount > 0) && (
              <View style={styles.summaryRow}>
                <Text style={{ ...styles.summaryLabel, color: "#0f6b4f" }}>
                  Diskon {data.discountType === "PERCENTAGE" ? `(${data.discountValue}%)` : ""}
                </Text>
                <Text style={{ ...styles.summaryValue, color: "#0f6b4f" }}>
                  -{formatCurrency(data.discountAmount || 0, data.currency)}
                </Text>
              </View>
            )}

            {Boolean(data.taxAmount && data.taxAmount > 0) && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Pajak (PPN {data.taxRate || 0}%)
                </Text>
                <Text style={styles.summaryValue}>
                  +{formatCurrency(data.taxAmount || 0, data.currency)}
                </Text>
              </View>
            )}

            {/* Total Box */}
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>TOTAL TAGIHAN</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.total, data.currency)}
              </Text>
            </View>
          </View>

          {/* Notes, Bank Info & Signature Row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 24 }}>
            <View style={{ flex: 1, paddingRight: 20 }}>
              {data.user.bankAccountNumber && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.label}>Informasi Pembayaran (Transfer Bank)</Text>
                  <Text style={styles.bold}>
                    {data.user.bankName} — {data.user.bankAccountNumber}
                  </Text>
                  <Text style={styles.text}>
                    a/n {data.user.bankAccountName || data.user.name}
                  </Text>
                </View>
              )}

              {data.notes && (
                <View>
                  <Text style={styles.label}>Catatan</Text>
                  <Text style={styles.text}>{data.notes}</Text>
                </View>
              )}
            </View>

            {/* Signature & Stamp Section (Jika ada) */}
            {(data.user.signatureUrl || data.user.stampUrl) && (
              <View style={styles.signatureBox}>
                <Text style={{ fontSize: 8, color: "#666", marginBottom: 2 }}>
                  Hormat Kami,
                </Text>
                <View style={styles.signatureImageWrapper}>
                  {data.user.signatureUrl && (
                    <Image src={data.user.signatureUrl} style={styles.signatureImg} />
                  )}
                  {data.user.stampUrl && (
                    <Image src={data.user.stampUrl} style={styles.stampImg} />
                  )}
                </View>
                <Text style={styles.signatureName}>
                  {data.user.name}
                </Text>
                <Text style={styles.signatureTitle}>
                  {data.user.businessName || "Otorisasi Pembayaran"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        {data.isFree ? (
          <Text style={styles.footer}>
            Dibuat dengan NotaKu — Aplikasi Invoice & Billing UMKM Indonesia (notaku.store)
          </Text>
        ) : (
          <Text style={styles.footer}>
            {data.user.businessName || data.user.name}
          </Text>
        )}
      </Page>
    </Document>
  );
}

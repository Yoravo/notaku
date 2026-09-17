import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/pdf/types";
import { statusColors, statusText } from "@/lib/pdf/types";
import { formatCurrency } from "@/lib/pdf/format";
import { getFontFamilies } from "@/lib/pdf/theme-helper";

const makeStyles = (fonts: any, accentColor: string) =>
  StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: fonts.regular },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
    },
    headerRight: {
      width: 220,
      alignItems: "flex-end",
    },
    logoWrapper: {
      width: "100%",
      alignItems: "flex-end",
      marginBottom: 6,
    },
    logo: {
      height: 42,
      objectFit: "contain",
    },
    title: { fontSize: 22, fontFamily: fonts.bold, color: accentColor },
    invoiceNumber: { fontSize: 10, color: "#555", marginTop: 4 },
    statusBadge: {
      fontSize: 9,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      marginTop: 6,
    },
    section: { marginBottom: 16 },
    label: {
      fontSize: 8,
      color: "#888",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    bold: { fontFamily: fonts.bold },
    text: { color: "#333", lineHeight: 1.5 },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      marginVertical: 16,
    },
    table: { marginTop: 16 },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: accentColor,
      paddingBottom: 8,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
    },
    colDesc: { flex: 1 },
    colQty: { width: 40, textAlign: "right" },
    colPrice: { width: 90, textAlign: "right" },
    colAmount: { width: 90, textAlign: "right" },
    summaryRow: {
      flexDirection: "row",
      paddingVertical: 3,
    },
    summaryLabel: {
      flex: 1,
      textAlign: "right",
      fontFamily: fonts.regular,
      fontSize: 9,
      color: "#555",
    },
    summaryValue: {
      width: 90,
      textAlign: "right",
      fontFamily: fonts.bold,
      fontSize: 9,
      color: "#222",
    },
    totalRow: {
      flexDirection: "row",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1.5,
      borderTopColor: accentColor,
    },
    totalLabel: {
      flex: 1,
      textAlign: "right",
      fontFamily: fonts.bold,
      fontSize: 11,
      color: accentColor,
    },
    totalValue: {
      width: 90,
      textAlign: "right",
      fontFamily: fonts.bold,
      fontSize: 11,
      color: accentColor,
    },
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
      fontFamily: fonts.bold,
      color: "#222",
      borderTopWidth: 1,
      borderTopColor: accentColor,
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
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: "center",
      fontSize: 8,
      color: "#aaa",
    },
  });

export function ClassicTemplate({ data }: { data: InvoiceData }) {
  const statusColor = statusColors[data.status] || statusColors.DRAFT;
  const fonts = getFontFamilies(data.themeFont);
  const accentColor = data.themeColor || "#111";
  const styles = makeStyles(fonts, accentColor);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.number}</Text>
            <View
              style={{ ...styles.statusBadge, backgroundColor: statusColor.bg }}
            >
              <Text
                style={{
                  fontSize: 9,
                  color: statusColor.text,
                  fontFamily: fonts.bold,
                }}
              >
                {statusText[data.status] || data.status}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {data.user.logoUrl && (
              <View style={styles.logoWrapper}>
                <Image src={data.user.logoUrl} style={styles.logo} />
              </View>
            )}
            <Text style={[styles.bold, { textAlign: "right", width: "100%" }]}>
              {data.user.businessName || data.user.name}
            </Text>
            {data.user.email && (
              <Text style={[styles.text, { textAlign: "right", width: "100%" }]}>
                {data.user.email}
              </Text>
            )}
            {data.user.phone && (
              <Text style={[styles.text, { textAlign: "right", width: "100%" }]}>
                {data.user.phone}
              </Text>
            )}
            {data.user.address && (
              <Text style={[styles.text, { textAlign: "right", width: "100%" }]}>
                {data.user.address}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Customer & Dates */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.section}>
            <Text style={styles.label}>Ditagihkan kepada</Text>
            <Text style={styles.bold}>{data.customer.name}</Text>
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
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Jatuh tempo</Text>
                <Text style={styles.text}>{data.dueDate}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text
              style={{ ...styles.colDesc, ...styles.bold, color: accentColor }}
            >
              Deskripsi
            </Text>
            <Text
              style={{ ...styles.colQty, ...styles.bold, color: accentColor }}
            >
              Qty
            </Text>
            <Text
              style={{ ...styles.colPrice, ...styles.bold, color: accentColor }}
            >
              Harga
            </Text>
            <Text
              style={{ ...styles.colAmount, ...styles.bold, color: accentColor }}
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
              <Text style={{ ...styles.colAmount, color: "#111", fontFamily: fonts.bold }}>
                {formatCurrency(item.amount, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={{ marginTop: 16 }}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(data.subtotal || data.total, data.currency)}
            </Text>
          </View>

          {data.discountAmount ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Diskon{" "}
                {data.discountType === "PERCENTAGE"
                  ? `(${data.discountValue}%)`
                  : ""}
                :
              </Text>
              <Text style={{ ...styles.summaryValue, color: "#ef4444" }}>
                -{formatCurrency(data.discountAmount, data.currency)}
              </Text>
            </View>
          ) : null}

          {data.taxAmount ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pajak ({data.taxRate}%):</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(data.taxAmount, data.currency)}
              </Text>
            </View>
          ) : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Tagihan:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(data.total, data.currency)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={{ marginTop: 32 }}>
            <Text style={styles.label}>Catatan</Text>
            <Text style={styles.text}>{data.notes}</Text>
          </View>
        )}

        {/* Bank Details */}
        {data.user.bankAccountNumber && (
          <View style={{ marginTop: 24, padding: 12, backgroundColor: "#f9fafb", borderRadius: 4, borderLeftWidth: 3, borderLeftColor: accentColor }}>
            <Text style={styles.label}>Informasi Pembayaran</Text>
            <Text style={styles.bold}>{data.user.bankName}</Text>
            <Text style={styles.text}>{data.user.bankAccountNumber}</Text>
            <Text style={styles.text}>a.n. {data.user.bankAccountName}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureImageWrapper}>
              {data.user.signatureUrl && (
                <Image src={data.user.signatureUrl} style={styles.signatureImg} />
              )}
              {data.user.stampUrl && (
                <Image src={data.user.stampUrl} style={styles.stampImg} />
              )}
            </View>
            <Text style={styles.signatureName}>
              {data.user.businessName || data.user.name}
            </Text>
            <Text style={styles.signatureTitle}>Authorized Signature</Text>
          </View>
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Halaman ${pageNumber} dari ${totalPages} — Invoice ${data.number}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

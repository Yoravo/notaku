import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { InvoiceData } from "../types";
import { statusText } from "../types";
import { formatCurrency } from "@/lib/pdf/format";

const ACCENT = "#0f6b4f";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  accentLine: { height: 4, backgroundColor: ACCENT, marginBottom: 36 },
  logo: {
    height: 50,
    objectFit: "contain",
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  brand: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  businessDetail: { color: "#666", marginTop: 2 },
  invoiceTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: "#111",
    marginBottom: 4,
  },
  invoiceMeta: { color: "#888", fontSize: 9 },
  label: {
    fontSize: 8,
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  bold: { fontFamily: "Helvetica-Bold" },
  text: { color: "#444", lineHeight: 1.6 },
  section: { marginBottom: 20 },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    marginVertical: 24,
  },
  table: {},
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  colDesc: { flex: 1 },
  colQty: { width: 40, textAlign: "right" },
  colPrice: { width: 90, textAlign: "right" },
  colAmount: { width: 90, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: ACCENT,
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  totalValue: {
    width: 90,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: "#111",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: "#aaa" },
});

export function MinimalTemplate({ data }: { data: InvoiceData }) {
  const status = statusText[data.status] || data.status;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Accent line top */}
        <View style={styles.accentLine} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            {data.user.logoUrl && (
              <Image src={data.user.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.brand}>
              {data.user.businessName || data.user.name}
            </Text>
            {data.user.email && (
              <Text style={styles.businessDetail}>{data.user.email}</Text>
            )}
            {data.user.phone && (
              <Text style={styles.businessDetail}>{data.user.phone}</Text>
            )}
            {data.user.address && (
              <Text style={styles.businessDetail}>{data.user.address}</Text>
            )}
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceMeta}>{data.number}</Text>
            <Text style={[styles.invoiceMeta, { marginTop: 4 }]}>{status}</Text>
          </View>
        </View>

        {/* Customer & Dates */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.section}>
            <Text style={styles.label}>Kepada</Text>
            <Text style={[styles.bold, { color: "#111" }]}>
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
          <View style={{ textAlign: "right" }}>
            <Text style={styles.label}>Tanggal</Text>
            <Text style={styles.text}>{data.createdAt}</Text>
            {data.dueDate && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Jatuh Tempo</Text>
                <Text style={styles.text}>{data.dueDate}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.colDesc, ...styles.bold, color: ACCENT }}>
              Deskripsi
            </Text>
            <Text style={{ ...styles.colQty, ...styles.bold, color: ACCENT }}>
              Qty
            </Text>
            <Text style={{ ...styles.colPrice, ...styles.bold, color: ACCENT }}>
              Harga
            </Text>
            <Text
              style={{ ...styles.colAmount, ...styles.bold, color: ACCENT }}
            >
              Jumlah
            </Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={{ ...styles.colDesc, color: "#222" }}>
                {item.description}
              </Text>
              <Text style={{ ...styles.colQty, color: "#666" }}>
                {item.quantity}
              </Text>
              <Text style={{ ...styles.colPrice, color: "#666" }}>
                {formatCurrency(item.price)}
              </Text>
              <Text
                style={{ ...styles.colAmount, ...styles.bold, color: "#222" }}
              >
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(data.total)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.label}>Catatan</Text>
            <Text style={styles.text}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {data.user.businessName || data.user.name}
          </Text>
          <Text style={styles.footerText}>{data.number}</Text>
        </View>
      </Page>
    </Document>
  );
}

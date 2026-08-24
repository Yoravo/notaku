import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/pdf/types";
import { statusColors, statusText } from "@/lib/pdf/types";
import { formatCurrency } from "@/lib/pdf/format";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
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
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#111" },
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
  bold: { fontFamily: "Helvetica-Bold" },
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
    borderBottomColor: "#d1d5db",
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
  totalRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#111",
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  totalValue: {
    width: 90,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
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
                  fontFamily: "Helvetica-Bold",
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
              style={{ ...styles.colAmount, ...styles.bold, color: "#374151" }}
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
                {formatCurrency(item.price)}
              </Text>
              <Text
                style={{ ...styles.colAmount, ...styles.bold, color: "#111" }}
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
        {data.isFree ? (
          <Text style={styles.footer}>
            Dibuat dengan NotaKu — notaku.vercel.app
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

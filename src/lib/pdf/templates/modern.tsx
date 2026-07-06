import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceData } from "../types";
import { statusText } from "../types";
import { formatCurrency } from "@/lib/pdf/format";

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 10, fontFamily: "Helvetica" },
  header: { backgroundColor: "#1b1916", padding: 40, paddingBottom: 32 },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 3,
  },
  headerNumber: { fontSize: 10, color: "#9ca3af", marginTop: 4 },
  headerBusiness: { textAlign: "right", maxWidth: 200 },
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
  totalBox: {
    marginTop: 16,
    backgroundColor: "#1b1916",
    borderRadius: 6,
    padding: 16,
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
              <Text style={styles.headerBusinessName}>
                {data.user.businessName || data.user.name}
              </Text>
              {data.user.email && (
                <Text style={styles.headerBusinessDetail}>
                  {data.user.email}
                </Text>
              )}
              {data.user.phone && (
                <Text style={styles.headerBusinessDetail}>
                  {data.user.phone}
                </Text>
              )}
              {data.user.address && (
                <Text style={[styles.headerBusinessDetail, { marginTop: 4 }]}>
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
                  {formatCurrency(item.price)}
                </Text>
                <Text
                  style={{ ...styles.colAmount, ...styles.bold, color: "#111" }}
                >
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total Box */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(data.total)}
            </Text>
          </View>

          {/* Notes */}
          {data.notes && (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.label}>Catatan</Text>
              <Text style={styles.text}>{data.notes}</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          {data.user.businessName || data.user.name}
        </Text>
      </Page>
    </Document>
  );
}

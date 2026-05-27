import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
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

const statusColors: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "#f3f4f6", text: "#374151" },
  SENT: { bg: "#eff6ff", text: "#1d4ed8" },
  PAID: { bg: "#f0fdf4", text: "#15803d" },
  OVERDUE: { bg: "#fef2f2", text: "#b91c1c" },
  CANCELLED: { bg: "#f3f4f6", text: "#6b7280" },
};

const statusText: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Terkirim",
  PAID: "Lunas",
  OVERDUE: "Jatuh Tempo",
  CANCELLED: "Dibatalkan",
};

type InvoiceData = {
  number: string;
  status: string;
  createdAt: string;
  dueDate: string | null;
  notes: string | null;
  customer: { name: string; email?: string; phone?: string; address?: string };
  user: {
    name: string;
    businessName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: {
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }[];
  total: number;
  isFree: boolean;
};

export function InvoicePDF({ data }: { data: InvoiceData }) {
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
          <View style={{ textAlign: "right", maxWidth: 200 }}>
            <Text style={styles.bold}>
              {data.user.businessName || data.user.name}
            </Text>
            {data.user.email && (
              <Text style={styles.text}>{data.user.email}</Text>
            )}
            {data.user.phone && (
              <Text style={styles.text}>{data.user.phone}</Text>
            )}
            {data.user.address && (
              <Text style={styles.text}>{data.user.address}</Text>
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
                Rp{item.price.toLocaleString("id-ID")}
              </Text>
              <Text
                style={{ ...styles.colAmount, ...styles.bold, color: "#111" }}
              >
                Rp{item.amount.toLocaleString("id-ID")}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rp{data.total.toLocaleString("id-ID")}
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

export async function renderInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return await renderToBuffer(<InvoicePDF data={data} />);
}

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { renderToBuffer } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  invoiceNumber: { fontSize: 10, color: "#666", marginTop: 4 },
  section: { marginBottom: 20 },
  label: {
    fontSize: 8,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  table: { marginTop: 20 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: "right" },
  colPrice: { width: 80, textAlign: "right" },
  colAmount: { width: 80, textAlign: "right" },
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
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
});

type InvoiceData = {
  number: string;
  createdAt: string;
  dueDate: string | null;
  notes: string | null;
  customer: { name: string; email?: string; phone?: string; address?: string };
  user: {
    name: string;
    businessName?: string;
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.number}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.bold}>
              {data.user.businessName || data.user.name}
            </Text>
            {data.user.phone && <Text>{data.user.phone}</Text>}
            {data.user.address && <Text>{data.user.address}</Text>}
          </View>
        </View>

        {/* Customer & Dates */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.section}>
            <Text style={styles.label}>Ditagihkan kepada</Text>
            <Text style={styles.bold}>{data.customer.name}</Text>
            {data.customer.email && <Text>{data.customer.email}</Text>}
            {data.customer.phone && <Text>{data.customer.phone}</Text>}
            {data.customer.address && <Text>{data.customer.address}</Text>}
          </View>
          <View style={{ ...styles.section, textAlign: "right" }}>
            <Text style={styles.label}>Tanggal</Text>
            <Text>{data.createdAt}</Text>
            {data.dueDate && (
              <>
                <Text style={{ ...styles.label, marginTop: 8 }}>
                  Jatuh Tempo
                </Text>
                <Text>{data.dueDate}</Text>
              </>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.colDesc, ...styles.bold }}>Deskripsi</Text>
            <Text style={{ ...styles.colQty, ...styles.bold }}>Qty</Text>
            <Text style={{ ...styles.colPrice, ...styles.bold }}>Harga</Text>
            <Text style={{ ...styles.colAmount, ...styles.bold }}>Jumlah</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                Rp{item.price.toLocaleString("id-ID")}
              </Text>
              <Text style={styles.colAmount}>
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
          <View style={{ marginTop: 20 }}>
            <Text style={styles.label}>Catatan</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        {/* Watermark */}
        {data.isFree && <Text style={styles.footer}>Dibuat dengan NotaKu</Text>}
      </Page>
    </Document>
  );
}

export async function renderInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return await renderToBuffer(<InvoicePDF data={data} />)
  }

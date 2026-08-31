import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { DeliveryOrderData } from "@/lib/pdf/types";

const EMERALD = "#0f6b4f";
const DARK = "#1e293b";
const BORDER = "#cbd5e1";
const LIGHT_BG = "#f8fafc";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  container: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: 20,
    height: "100%",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: EMERALD,
  },
  senderInfo: {
    maxWidth: 260,
  },
  businessName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  senderDetail: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 1.3,
  },
  titleSection: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: EMERALD,
    letterSpacing: 1,
  },
  metaText: {
    fontSize: 8.5,
    color: DARK,
    marginTop: 2,
  },
  metaBold: {
    fontFamily: "Helvetica-Bold",
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: LIGHT_BG,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaCol: {
    flex: 1,
  },
  metaColLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  recipientName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  recipientDetail: {
    fontSize: 8,
    color: "#475569",
    marginTop: 1,
  },
  table: {
    marginTop: 4,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: EMERALD,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  tableHeaderColNo: { width: "7%", textAlign: "center" },
  tableHeaderColDesc: { width: "55%" },
  tableHeaderColQty: { width: "13%", textAlign: "center" },
  tableHeaderColUnit: { width: "10%", textAlign: "center" },
  tableHeaderColNotes: { width: "15%" },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#fafafa",
  },
  tableColNo: { width: "7%", textAlign: "center", fontSize: 8, color: "#64748b" },
  tableColDesc: { width: "55%", fontSize: 8.5, color: DARK },
  tableColQty: { width: "13%", textAlign: "center", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: DARK },
  tableColUnit: { width: "10%", textAlign: "center", fontSize: 8, color: "#475569" },
  tableColNotes: { width: "15%", fontSize: 7.5, color: "#64748b" },

  notesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  notesText: {
    fontSize: 8,
    color: "#78350f",
    lineHeight: 1.3,
  },

  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 10,
  },
  sigBox: {
    width: "30%",
    alignItems: "center",
  },
  sigTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textTransform: "uppercase",
    marginBottom: 40, // Ruang tanda tangan
  },
  sigLine: {
    width: "85%",
    borderTopWidth: 1,
    borderTopColor: "#94a3b8",
    paddingTop: 3,
    alignItems: "center",
  },
  sigName: {
    fontSize: 8,
    color: "#475569",
    textAlign: "center",
  },

  footer: {
    position: "absolute",
    bottom: 8,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 7,
    color: "#94a3b8",
  },
});

export function DeliveryOrderTemplate({ data }: { data: DeliveryOrderData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.senderInfo}>
              <Text style={styles.businessName}>
                {data.sender.businessName || data.sender.name}
              </Text>
              {data.sender.address && (
                <Text style={styles.senderDetail}>{data.sender.address}</Text>
              )}
              {data.sender.phone && (
                <Text style={styles.senderDetail}>Telp/WA: {data.sender.phone}</Text>
              )}
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.title}>SURAT JALAN</Text>
              <Text style={styles.metaText}>
                No: <Text style={styles.metaBold}>{data.orderNumber}</Text>
              </Text>
              <Text style={styles.metaText}>
                Tanggal: <Text style={styles.metaBold}>{data.date}</Text>
              </Text>
              {data.poNumber && (
                <Text style={styles.metaText}>
                  Ref PO: <Text style={styles.metaBold}>{data.poNumber}</Text>
                </Text>
              )}
            </View>
          </View>

          {/* Recipient & Transport Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaColLabel}>Tujuan Pengiriman (Penerima):</Text>
              <Text style={styles.recipientName}>
                {data.recipient.name} {data.recipient.company ? `(${data.recipient.company})` : ""}
              </Text>
              {data.recipient.address && (
                <Text style={styles.recipientDetail}>{data.recipient.address}</Text>
              )}
              {data.recipient.phone && (
                <Text style={styles.recipientDetail}>Kontak: {data.recipient.phone}</Text>
              )}
            </View>

            {(data.vehicleNumber || data.driverName) && (
              <View style={[styles.metaCol, { maxWidth: 160 }]}>
                <Text style={styles.metaColLabel}>Informasi Pengangkutan:</Text>
                {data.driverName && (
                  <Text style={styles.recipientDetail}>
                    Kurir/Sopir: <Text style={styles.metaBold}>{data.driverName}</Text>
                  </Text>
                )}
                {data.vehicleNumber && (
                  <Text style={styles.recipientDetail}>
                    No. Kendaraan: <Text style={styles.metaBold}>{data.vehicleNumber}</Text>
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.tableHeaderColNo}>
                <Text style={styles.tableHeaderText}>No</Text>
              </View>
              <View style={styles.tableHeaderColDesc}>
                <Text style={styles.tableHeaderText}>Nama Barang / Deskripsi</Text>
              </View>
              <View style={styles.tableHeaderColQty}>
                <Text style={styles.tableHeaderText}>Qty</Text>
              </View>
              <View style={styles.tableHeaderColUnit}>
                <Text style={styles.tableHeaderText}>Satuan</Text>
              </View>
              <View style={styles.tableHeaderColNotes}>
                <Text style={styles.tableHeaderText}>Keterangan</Text>
              </View>
            </View>

            {data.items.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowEven : {},
                ]}
              >
                <View style={styles.tableColNo}>
                  <Text>{idx + 1}</Text>
                </View>
                <View style={styles.tableColDesc}>
                  <Text>{item.description}</Text>
                </View>
                <View style={styles.tableColQty}>
                  <Text>{item.quantity}</Text>
                </View>
                <View style={styles.tableColUnit}>
                  <Text>{item.unit || "Pcs"}</Text>
                </View>
                <View style={styles.tableColNotes}>
                  <Text>{item.notes || "-"}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Catatan Khusus */}
          {data.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Catatan / Instruksi Pengiriman:</Text>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          )}

          {/* 3 Tanda Tangan: Pengirim, Kurir/Ekspedisi, Penerima */}
          <View style={styles.signatureContainer}>
            <View style={styles.sigBox}>
              <Text style={styles.sigTitle}>Pengirim / Gudang</Text>
              <View style={styles.sigLine}>
                <Text style={styles.sigName}>( {data.sender.name} )</Text>
              </View>
            </View>

            <View style={styles.sigBox}>
              <Text style={styles.sigTitle}>Sopir / Kurir</Text>
              <View style={styles.sigLine}>
                <Text style={styles.sigName}>( {data.driverName || "........................"} )</Text>
              </View>
            </View>

            <View style={styles.sigBox}>
              <Text style={styles.sigTitle}>Penerima Barang</Text>
              <View style={styles.sigLine}>
                <Text style={styles.sigName}>( {data.recipient.name} )</Text>
              </View>
            </View>
          </View>

          {/* Footer Watermark */}
          {data.isFree ? (
            <Text style={styles.footer}>
              Dokumen Pengiriman Resmi • Dibuat gratis melalui NotaKu (notaku.store) — Solusi Invoice & Dokumen Usaha UMKM
            </Text>
          ) : (
            <Text style={styles.footer}>
              Dokumen Pengiriman Barang Sah • {data.sender.businessName || data.sender.name}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

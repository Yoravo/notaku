import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { ReceiptData } from "@/lib/pdf/types";
import { formatCurrency } from "@/lib/pdf/format";

const EMERALD = "#0f6b4f";
const DARK = "#1e293b";
const BORDER = "#cbd5e1";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  container: {
    borderWidth: 1.5,
    borderColor: EMERALD,
    borderRadius: 6,
    padding: 24,
    height: "100%",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 280,
  },
  logo: {
    height: 44,
    maxWidth: 90,
    objectFit: "contain",
    marginRight: 12,
  },
  businessInfo: {
    justifyContent: "center",
  },
  businessName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  businessDetail: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 1.3,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: EMERALD,
    letterSpacing: 1.5,
  },
  receiptNumber: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginTop: 3,
  },
  invoiceRef: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 1,
  },
  content: {
    marginTop: 18,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  fieldLabel: {
    width: 140,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textTransform: "uppercase",
  },
  separator: {
    width: 15,
    fontSize: 9,
    color: DARK,
  },
  fieldValue: {
    flex: 1,
    fontSize: 9.5,
    color: DARK,
    lineHeight: 1.4,
  },
  wordsBox: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 4,
    padding: 8,
  },
  wordsText: {
    fontSize: 9.5,
    fontFamily: "Helvetica-BoldOblique",
    color: EMERALD,
    lineHeight: 1.4,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  amountBoxWrapper: {
    width: 220,
  },
  amountLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  amountBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: EMERALD,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  amountText: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: EMERALD,
    letterSpacing: 0.5,
  },
  paymentDateMeta: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 6,
  },
  signatureSection: {
    width: 190,
    alignItems: "center",
    textAlign: "center",
  },
  datePlaceText: {
    fontSize: 8.5,
    color: "#475569",
    marginBottom: 4,
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
  lunasBadge: {
    position: "absolute",
    left: 20,
    top: 10,
    borderWidth: 1.5,
    borderColor: "#15803d",
    backgroundColor: "rgba(240, 253, 244, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
    transform: "rotate(-12deg)",
  },
  lunasText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#15803d",
    letterSpacing: 1,
  },
  signerName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    borderTopWidth: 1,
    borderTopColor: "#475569",
    paddingTop: 4,
    width: "100%",
    textAlign: "center",
  },
  signerTitle: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 8,
    left: 24,
    right: 24,
    textAlign: "center",
    fontSize: 7.5,
    color: "#94a3b8",
  },
});

export function ReceiptTemplate({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {data.user.logoUrl && (
                <Image src={data.user.logoUrl} style={styles.logo} />
              )}
              <View style={styles.businessInfo}>
                <Text style={styles.businessName}>
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
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.title}>KUITANSI</Text>
              <Text style={styles.receiptNumber}>No: {data.receiptNumber}</Text>
              <Text style={styles.invoiceRef}>
                Ref. Invoice: {data.invoiceNumber}
              </Text>
            </View>
          </View>

          {/* Content Rows */}
          <View style={styles.content}>
            {/* Telah Terima Dari */}
            <View style={styles.row}>
              <Text style={styles.fieldLabel}>Telah Terima Dari</Text>
              <Text style={styles.separator}>:</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldValue, { fontFamily: "Helvetica-Bold" }]}>
                  {data.customer.name}
                </Text>
                {data.customer.address && (
                  <Text style={[styles.fieldValue, { fontSize: 8.5, color: "#64748b" }]}>
                    {data.customer.address}
                  </Text>
                )}
              </View>
            </View>

            {/* Uang Sejumlah (Terbilang) */}
            <View style={styles.row}>
              <Text style={styles.fieldLabel}>Uang Sejumlah</Text>
              <Text style={styles.separator}>:</Text>
              <View style={styles.wordsBox}>
                <Text style={styles.wordsText}># {data.totalWords} #</Text>
              </View>
            </View>

            {/* Untuk Pembayaran */}
            <View style={styles.row}>
              <Text style={styles.fieldLabel}>Untuk Pembayaran</Text>
              <Text style={styles.separator}>:</Text>
              <Text style={styles.fieldValue}>
                {data.itemsSummary
                  ? `Pelunasan Invoice ${data.invoiceNumber} (${data.itemsSummary})`
                  : `Pelunasan tagihan resmi Invoice ${data.invoiceNumber}`}
              </Text>
            </View>
          </View>

          {/* Bottom Section: Nominal Box & Tanda Tangan */}
          <View style={styles.bottomSection}>
            <View style={styles.amountBoxWrapper}>
              <Text style={styles.amountLabel}>Jumlah Pembayaran</Text>
              <View style={styles.amountBox}>
                <Text style={styles.amountText}>
                  {formatCurrency(data.total, data.currency)}
                </Text>
              </View>
              <Text style={styles.paymentDateMeta}>
                Metode: {data.paymentMethod}
              </Text>
            </View>

            <View style={styles.signatureSection}>
              <Text style={styles.datePlaceText}>
                {data.paidAt}
              </Text>
              <View style={styles.signatureImageWrapper}>
                {/* LUNAS Stempel Badge */}
                <View style={styles.lunasBadge}>
                  <Text style={styles.lunasText}>LUNAS</Text>
                </View>

                {data.user.signatureUrl && (
                  <Image src={data.user.signatureUrl} style={styles.signatureImg} />
                )}
                {data.user.stampUrl && (
                  <Image src={data.user.stampUrl} style={styles.stampImg} />
                )}
              </View>
              <Text style={styles.signerName}>
                {data.user.name}
              </Text>
              <Text style={styles.signerTitle}>
                {data.user.businessName || "Penerima Pembayaran"}
              </Text>
            </View>
          </View>

          {/* Footer watermark */}
          {data.isFree ? (
            <Text style={styles.footer}>
              Bukti Pembayaran Resmi • Diterbitkan secara digital melalui NotaKu (notaku.vercel.app)
            </Text>
          ) : (
            <Text style={styles.footer}>
              Bukti Pembayaran Sah & Resmi • {data.user.businessName || data.user.name}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

import { ImageResponse } from "next/og";

export const alt = "NotaKu - Invoice Generator untuk UMKM";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#faf7f0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "9999px",
            background: "#0f6b4f",
          }}
        />
        <span style={{ fontSize: "28px", color: "#6b6459" }}>
          Untuk UMKM Indonesia
        </span>
      </div>
      <div
        style={{
          fontSize: "80px",
          fontWeight: 700,
          color: "#1b1916",
          lineHeight: 1.1,
          letterSpacing: "-2px",
        }}
      >
        Tagih pelanggan,
      </div>
      <div
        style={{
          fontSize: "80px",
          fontWeight: 700,
          color: "#0f6b4f",
          lineHeight: 1.1,
          letterSpacing: "-2px",
        }}
      >
        tanpa ribet.
      </div>
      <div style={{ fontSize: "32px", color: "#6b6459", marginTop: "32px" }}>
        Invoice profesional dalam 30 detik · NotaKu
      </div>
    </div>,
    { ...size },
  );
}

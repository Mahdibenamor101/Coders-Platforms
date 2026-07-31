import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #047857 0%, #059669 50%, #2563eb 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            FL
          </div>
          <div style={{ fontSize: 64, fontWeight: 800 }}>FleetLink</div>
        </div>
        <div style={{ fontSize: 32, opacity: 0.9, textAlign: "center", maxWidth: 900 }}>
          Gestion logistique de tracteurs &amp; remorques, planification automatique et
          notifications WhatsApp
        </div>
      </div>
    ),
    { ...size }
  );
}

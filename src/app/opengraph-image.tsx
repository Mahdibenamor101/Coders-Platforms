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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCIgeTE9IjAiIHgyPSI0OCIgeTI9IjQ4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzBkNWM0MiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNDc4NTciLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSI0NiIgaGVpZ2h0PSI0NiIgcng9IjEzIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxjaXJjbGUgY3g9IjExIiBjeT0iMzUiIHI9IjIuOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDFmYWU1IiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuODUiLz4KICA8cGF0aCBkPSJNMTEgMzUgQyAxOCAzNSwgMTYgMjIsIDI0IDIyIEMgMzIgMjIsIDMwIDEyLCAzOCAxMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNmVlN2I3IiBzdHJva2Utd2lkdGg9IjMuNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPGNpcmNsZSBjeD0iMzgiIGN5PSIxMiIgcj0iMy42IiBmaWxsPSIjZmJiZjI0IiBzdHJva2U9IiMwZDVjNDIiIHN0cm9rZS13aWR0aD0iMS4zIi8+Cjwvc3ZnPgo="
            width={72}
            height={72}
            style={{ borderRadius: 18 }}
          />
          <div style={{ display: "flex", fontSize: 60, fontWeight: 800 }}>
            <span>LOGISTICS</span>
            <span style={{ color: "#a7f3d0" }}>@MAHDI</span>
          </div>
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

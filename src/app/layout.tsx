import type { Metadata } from "next";
import "./globals.css";

const title = "FleetLink - Gestion logistique tracteurs & remorques";
const description =
  "SaaS de gestion de flotte : tracteurs, remorques, chauffeurs, missions, planification automatique, notifications WhatsApp et recommandations intelligentes.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title,
  description,
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: { title, description, type: "website", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}

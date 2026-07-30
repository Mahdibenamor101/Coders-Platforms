import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FleetLink - Gestion logistique tracteurs & remorques",
  description:
    "SaaS de gestion de flotte : tracteurs, remorques, chauffeurs, missions, notifications WhatsApp et recommandations intelligentes.",
  manifest: "/manifest.json",
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

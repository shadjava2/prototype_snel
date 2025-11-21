import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context";
import { SNELProvider } from "@/lib/snel-context";

export const metadata: Metadata = {
  title: "Plateforme de Facturation CRM - SNEL",
  description: "Plateforme de gestion de facturation et CRM pour la Société Nationale d'Électricité (SNEL)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0033A0" />
      </head>
      <body className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 relative">
        <AuthProvider>
          <SNELProvider>{children}</SNELProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

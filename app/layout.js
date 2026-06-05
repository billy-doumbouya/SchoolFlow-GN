import "./globals.css";
import { Toaster } from "sonner";
import ProgressBar from "@/components/layout/ProgressBar";

export const metadata = {
  title: {
    default: "SchoolFlow — Plateforme Intelligente de Gestion Scolaire",
    template: "%s | SchoolFlow",
  },
  description:
    "SchoolFlow-GN digitalise la gestion de votre établissement scolaire en Guinée. Élèves, enseignants, notes, paiements — tout en un. Créé par G-Tech Academy.",
  keywords: [
    "gestion scolaire",
    "école",
    "Guinée",
    "élèves",
    "enseignants",
    "SchoolFlow-GN",
  ],
  authors: [{ name: "G-Tech Academy" }],
  openGraph: {
    type: "website",
    locale: "fr_GN",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://schoolflow.gn",
    siteName: "SchoolFlow-GN",
    title: "SchoolFlow-GN — Plateforme Intelligente de Gestion Scolaire",
    description:
      "Gérez votre école en toute simplicité. Paiements Mobile Money intégrés.",
    images: [
      {
        url: "/schoolflow-logo.png",
        width: 1200,
        height: 630,
        alt: "SchoolFlow-GN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SchoolFlow-GN — Gestion Scolaire en Guinée",
    images: ["/schoolflow-logo.png"],
  },
  icons: {
    icon: "/schoolflow-logo.png",
    shortcut: "/schoolflow-logo.png",
    apple: "/schoolflow-logo.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" translate="no">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        /> */}
      </head>
      <body className="antialiased">
        <ProgressBar />
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#0f1729",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "13px",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}

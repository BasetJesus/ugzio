import type { Metadata } from "next";
import { Inter, Geist_Mono, Fraunces } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/lib/ui/theme-provider";
import { SessionProvider } from "@/lib/auth/session-provider";
import AnalyticsProvider from "@/components/shared/AnalyticsProvider";
import { ToastProvider } from "@/components/shared/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ugzio.vercel.app"),
  title: "UGZIO — Réduction des Annulations Ecommerce en Tunisie",
  description:
    "UGZIO réduit les annulations ecommerce Tunisie. Automatisation post-achat, confiance acheteur, WhatsApp psychology engine. Protégez votre revenue COD.",
  openGraph: {
    title: "UGZIO — Réduction des Annulations Ecommerce en Tunisie",
    description:
      "UGZIO réduit les annulations ecommerce Tunisie. Automatisation post-achat, confiance acheteur, WhatsApp psychology engine. Protégez votre revenue COD.",
    url: "https://ugzio.vercel.app",
    siteName: "UGZIO",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UGZIO — Réduction des Annulations Ecommerce en Tunisie",
    description:
      "UGZIO réduit les annulations ecommerce Tunisie. Automatisation post-achat, confiance acheteur, WhatsApp psychology engine. Protégez votre revenue COD.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var e=localStorage.getItem("ugzio-theme");if(!e||e==="light"){document.documentElement.classList.add("theme-light")}else{document.documentElement.classList.add("theme-dark")}}catch(e){document.documentElement.classList.add("theme-light")}})()`
        }} />
      </head>
      <body className="min-h-dvh bg-[var(--bg-base)] text-[var(--text-primary)]">
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              <AnalyticsProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </AnalyticsProvider>
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

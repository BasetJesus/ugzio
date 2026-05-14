import type { Metadata } from "next";
import { Inter, Geist_Mono, Fraunces } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/lib/ui/theme-provider";
import { SessionProvider } from "@/lib/auth/session-provider";
import AnalyticsProvider from "@/components/shared/AnalyticsProvider";
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
  title: "UGZIO — Réduction des Annulations Ecommerce en Tunisie",
  description:
    "UGZIO réduit les annulations ecommerce Tunisie. Automatisation post-achat, confiance acheteur, WhatsApp psychology engine. Protégez votre revenue COD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${fraunces.variable} antialiased theme-dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-[var(--bg-base)] text-[var(--text-primary)]">
        <ThemeProvider>
          <LanguageProvider>
            <SessionProvider>
              <AnalyticsProvider>
                {children}
              </AnalyticsProvider>
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

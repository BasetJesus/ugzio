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
  title: "UGZIO — Protection & Croissance pour E-commerce Tunisie",
  description:
    "UGZIO protège votre revenue COD et génère des captions IA pour votre e-commerce en Tunisie.",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: true,
    address: false,
    email: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-touch-fullscreen": "yes",
  },
  openGraph: {
    title: "UGZIO — Protection & Croissance pour E-commerce Tunisie",
    description:
      "UGZIO protège votre revenue COD et génère des captions IA pour votre e-commerce en Tunisie.",
    url: "https://ugzio.vercel.app",
    siteName: "UGZIO",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UGZIO — Protection & Croissance pour E-commerce Tunisie",
    description:
      "UGZIO protège votre revenue COD et génère des captions IA pour votre e-commerce en Tunisie.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
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
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="UGZIO" />
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

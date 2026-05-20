import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Cairo, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/lib/ui/theme-provider";
import { SessionProvider } from "@/lib/auth/session-provider";
import AnalyticsProvider from "@/components/shared/AnalyticsProvider";
import { ToastProvider } from "@/components/shared/Toast";
import BrandToaster from "@/components/shared/BrandToaster";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["500", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ugzio.vercel.app"),
  title: "UGZIO — Protection & Croissance pour E-commerce Tunisie",
  description:
    "UGZIO protège votre revenue COD et génère des captions IA pour votre e-commerce en Tunisie.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UGZIO",
  },
  formatDetection: {
    telephone: true,
    address: false,
    email: false,
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${inter.variable} ${cairo.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
                  <BrandToaster />
                </ToastProvider>
              </AnalyticsProvider>
            </SessionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

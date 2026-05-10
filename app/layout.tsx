import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UGZIO — Social Commerce OS for Tunisian Sellers",
  description:
    "AI caption generator in Tunisian Darija + seller dashboard with buyer trust scoring, order management, and blacklist protection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh bg-black text-zinc-100">
        <nav className="flex items-center justify-center gap-8 border-b border-zinc-800 px-4 py-2.5">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-200"
          >
            Captions
          </Link>
          <span className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            UGZIO
          </span>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-200"
          >
            Dashboard
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}

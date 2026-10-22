import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Ticket2Grow - Sri Lankan Cloud POS & Business Management SaaS",
  description: "Next-generation cloud POS, inventory, billing and multi-branch management platform built specifically for Sri Lankan SMEs and retail businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-marble-luxury text-neutral-900 selection:bg-emerald-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

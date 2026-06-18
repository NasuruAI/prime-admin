import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { getStoreName } from "@/lib/config";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const storeName = await getStoreName();
  return {
    title: {
      default: `${storeName} Admin`,
      template: `%s · ${storeName} Admin`,
    },
    description: `Back-office for ${storeName}.`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

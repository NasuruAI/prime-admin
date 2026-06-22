import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { getStoreBrand, getStoreName } from "@/lib/config";
import { brandStyle } from "@/lib/theme";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const brand = await getStoreBrand();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      style={brandStyle(brand.primary, brand.accent)}
    >
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}

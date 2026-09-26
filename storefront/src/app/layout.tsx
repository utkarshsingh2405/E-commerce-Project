import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/query-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VALENCE — Utilitarian Hardware & Objects",
  description: "Functional objects, apparel, and hardware made for daily endurance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
      </head>
      <body className="bg-canvas text-text-primary min-h-[100dvh] flex flex-col font-sans antialiased">
        <QueryProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}

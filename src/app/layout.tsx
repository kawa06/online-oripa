import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "ORIPA VAULT | オンラインオリパ",
  description: "高級感のあるオンラインオリパ・ガチャ販売",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-bg text-text antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

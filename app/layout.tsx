import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://ar-samoon-tiktok.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AR SAMOON — Premium Downloader",
  description:
    "Download TikTok and Instagram videos in HD, without watermark. Paste a link, get a clean file in seconds — built and maintained by AR SAMOON.",
  openGraph: {
    title: "AR SAMOON — Premium Downloader",
    description:
      "Download TikTok and Instagram videos in HD, without watermark. Paste a link, get a clean file in seconds.",
    url: SITE_URL,
    siteName: "AR SAMOON",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AR SAMOON — Premium Downloader",
    description:
      "Download TikTok and Instagram videos in HD, without watermark. Paste a link, get a clean file in seconds.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AR SAMOON",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0D12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="bg-void text-ivory font-sans antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import SwRegister from "@/components/SwRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "Ledzora — Stop chasing clients. Start closing books.",
  description:
    "Ledzora is the document-chasing app for bookkeepers: client checklists, one upload link per client, automatic reminders, and one red-amber-green status dashboard.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Ledzora" },
};

export const viewport: Viewport = {
  themeColor: "#0E2A47",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
        <SwRegister />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import SmoothScrolling from "@/components/SmoothScrolling";

export const metadata: Metadata = {
  metadataBase: new URL('https://pinghua.qzz.io'),
  title: {
    default: "PingHua - Streaming Donghua",
    template: "%s | PingHua", 
  },
  description: "Nonton Donghua Subtitle Indonesia Terlengkap & Modern.",
  keywords: ["donghua sub indo", "nonton donghua", "anime china", "streaming donghua", "donghua terbaru"],
  alternates: {
    canonical: 'https://pinghua.qzz.io',
  },
  authors: [{ name: "PingHua Team" }],
  creator: "PingHua",
  publisher: "PingHua",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://pinghua.qzz.io",
    siteName: "PingHua",
    title: "PingHua - Streaming Donghua",
    description: "Nonton Donghua Subtitle Indonesia Terlengkap.",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "PingHua" }],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icons/icon-512x512.webp", sizes: "512x512", type: "image/webp" },
    ],
    shortcut: "/icons/icon-192x192.webp",
    apple: "/icons/icon-192x192.webp",
  },
  twitter: {
    card: "summary_large_image",
    title: "PingHua - Streaming Donghua",
    description: "Streaming Donghua Subtitle Indonesia Terlengkap.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://wsrv.nl" />
        <link rel="dns-prefetch" href="https://wsrv.nl" />
        <link rel="preconnect" href="https://animexin.dev" />
        <link rel="dns-prefetch" href="https://animexin.dev" />
        <link rel="preconnect" href="https://poabpotcwqzsfzdmkezt.supabase.co" />
        <link rel="dns-prefetch" href="https://poabpotcwqzsfzdmkezt.supabase.co" />
      </head>
      <body
        className={`antialiased min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <Providers>
          <SmoothScrolling>
            <Navbar />
            <main className="flex-1 relative z-10">
              {children}
            </main>
            <Toaster />
            <Sonner />
          </SmoothScrolling>
        </Providers>
      </body>
    </html>
  );
}

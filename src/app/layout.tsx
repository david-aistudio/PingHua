import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import SmoothScrolling from "@/components/SmoothScrolling";

const fontSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // App-like feel
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pinghua.qzz.io'),
  title: {
    default: "PingHua - Nonton Donghua Sub Indo Terlengkap",
    template: "%s | PingHua", // Otomatis nambahin "| PingHua" di belakang judul halaman lain
  },
  description: "Platform streaming Donghua (Anime China) subtitle Indonesia terbaru, gratis, kualitas HD, dan tanpa iklan. Nonton Battle Through the Heavens, Soul Land, dan ribuan judul lainnya.",
  keywords: [
    "donghua sub indo", 
    "nonton donghua", 
    "streaming donghua", 
    "anime china", 
    "battle through the heavens sub indo", 
    "soul land sub indo", 
    "perfect world sub indo", 
    "cultivation donghua", 
    "martial arts donghua", 
    "donghua 3d", 
    "sankavollerei"
  ],
  authors: [{ name: "David" }, { name: "PingHua Team" }],
  creator: "David",
  publisher: "PingHua",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://pinghua.qzz.io",
    siteName: "PingHua",
    title: "PingHua - Nonton Donghua Sub Indo Gratis",
    description: "Streaming Donghua Subtitle Indonesia Terlengkap & Terupdate.",
    images: [
      {
        url: "/logo.png", // Pastikan ada file logo.png di public
        width: 1200,
        height: 630,
        alt: "PingHua Donghua Streaming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PingHua - Nonton Donghua Sub Indo",
    description: "Streaming Donghua Subtitle Indonesia Terlengkap & Terupdate.",
    creator: "@david-aistudio",
    images: ["/logo.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "kode-verifikasi-google-console-lo-disini",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SCHEMA: Sitelinks Search Box & Organization Logic
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PingHua",
    "url": "https://pinghua.qzz.io",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pinghua.qzz.io/search/{search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="id" className="dark">
      <body
        className={`${fontSans.variable} font-sans antialiased min-h-screen bg-background text-foreground flex flex-col selection:bg-white/20`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <SmoothScrolling>
            <main className="flex-1">
              {children}
            </main>
            <Navbar />
            <Toaster />
            <Sonner />
          </SmoothScrolling>
        </Providers>
      </body>
    </html>
  );
}

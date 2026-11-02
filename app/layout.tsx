import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Flash } from "@/components/flash";
import { WhatsAppFab } from "@/components/whatsapp-fab";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toko Bunga Online",
  description: "Toko Bunga Online - Pesan, Bayar, Lacak Pesanan",
};

export const viewport: Viewport = {
  themeColor: "#f9dfe6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>
        {/* Filter pembiasan untuk kaca bening (dipakai .glass-lens) */}
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter
            id="lens-refract"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.01"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="soft"
              scale="22"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
        {children}
        <Suspense fallback={null}>
          <Flash />
        </Suspense>
        <WhatsAppFab />
        <Toaster />
      </body>
    </html>
  );
}

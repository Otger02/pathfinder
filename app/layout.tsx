import type { Metadata, Viewport } from "next";
import { Manrope, Instrument_Serif, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pathfinder",
  description:
    "Información sobre derechos e inmigración en España — Fundació Tierra Digna",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pathfinder",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "Pathfinder",
    description: "Immigration rights and information in Spain",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches --primary (sage palette) in globals.css and the manifest.
  themeColor: "#2F6A5F",
  // Prevents the virtual keyboard from obscuring the chat input on mobile.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} ${instrumentSerif.variable} ${notoArabic.variable}`}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

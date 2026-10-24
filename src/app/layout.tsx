import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: {
    default: "JazzKeys — Leer Jazz Piano",
    template: "%s · JazzKeys",
  },
  description:
    "Leer jazz piano spelen: akkoorden, theorie, notenlezen en improvisatie",
  applicationName: "JazzKeys",
  appleWebApp: { capable: true, title: "JazzKeys", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="dark">
      <body className="bg-slate-950 text-slate-200 min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white"
        >
          Naar de inhoud
        </a>
        <Navbar />
        <main id="main" className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

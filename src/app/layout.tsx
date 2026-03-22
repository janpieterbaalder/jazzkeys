import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "JazzKeys — Leer Jazz Piano",
  description:
    "Leer jazz piano spelen: akkoorden, theorie, notenlezen en improvisatie",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="dark">
      <body className="bg-slate-950 text-slate-200 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

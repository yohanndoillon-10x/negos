import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Negos — Negotiation & Strategic Realism",
  description:
    "A knowledge base bridging realist statecraft with negotiation craft.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <header className="border-b border-gray-200">
          <nav className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold tracking-tight">
              Negos
            </a>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="/" className="hover:text-gray-900">
                Home
              </a>
              <a href="/compare" className="hover:text-gray-900">
                Compare
              </a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

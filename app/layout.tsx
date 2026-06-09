import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CompIQ - Compensation Intelligence Platform",
  description: "Real compensation data across levels, roles, and companies. Know your worth down to the level.",
  other: {
    "color-scheme": "dark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-darkreader-mode="dynamic"
      data-darkreader-scheme="dark"
      className={`${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>
        <div suppressHydrationWarning>
          <Navbar />
        </div>
        <main className="flex-grow pt-16">{children}</main>
        <footer className="border-t border-border-dark bg-[#0a0a0f] py-8 text-center text-sm text-text-muted">
          <div className="container mx-auto px-4">
            <p className="mb-2" suppressHydrationWarning>© {new Date().getFullYear()} CompIQ. All rights reserved.</p>
            <p className="text-xs text-text-muted/60">
              Disclaimer: All compensation data displayed is simulated and for demonstration purposes.
            </p>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}

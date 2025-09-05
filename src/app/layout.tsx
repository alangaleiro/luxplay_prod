import type { Metadata } from "next";
import { Geist, Geist_Mono, Russo_One } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const russoOne = Russo_One({
  variable: "--font-russo-one",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "LUXPLAY - Web3 DeFi Staking Platform",
  description: "Earn rewards with multi-level staking, referral programs, and networking in the LUXPLAY DeFi ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${russoOne.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <Navigation />
          <main className="min-h-screen relative bg-grainy-gradient">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
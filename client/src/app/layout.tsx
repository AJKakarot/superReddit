// client/src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth"; // No useAuth here
import React from "react";
import Navbar from "./Navbar";
import { ThemeProvider } from "@/lib/theme";
import { SocketProvider } from '@/contexts/SocketContext';
import { Analytics } from "@vercel/analytics/react";
import { FloatingSocialButton } from "@/components/FloatingSocialButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Supereddit",
  description: "Supereddit: AI Reddit Post Writing, Smart Scheduler, Keyword Tracking, Engagement Coordination, Analytics, and more for agencies & brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We can no longer determine the navbar state here on the server
  // This will be handled client-side or with a different pattern if needed.
  // For now, we simplify and let the Navbar decide its own state.

  return (
    <html lang="en" className={`light ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased pt-16"> {/* Add padding for fixed navbar */}
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider> {/* SocketProvider now wraps everything */}
              <Navbar />
              <ClientBody>{children}</ClientBody>
              <FloatingSocialButton />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
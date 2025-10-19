import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/providers/toast-provider";
import { AuthProvider } from "@/providers/session-provider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap"
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Portfolio Dashboard",
  description: "Admin dashboard for portfolio management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToasterProvider />
          <Script
            src="https://kit.fontawesome.com/ea8db09c1f.js"
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
          <Script id="load-devicon-css" strategy="afterInteractive">
            {`
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css';
              document.head.appendChild(link);
            `}
          </Script>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
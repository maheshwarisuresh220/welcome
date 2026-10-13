
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI & Healthcare Summit 2026 | 1885 SMI University",
  description:
    "Welcome to the AI & Healthcare Summit 2026 at 1885 SMI University. Advancing solutions for stress, mental health and diabetes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full antialiased"
      >
        {children}
      </body>
    </html>
  );
}

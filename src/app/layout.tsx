import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@css/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Igreja IAF",
  description: "Inscrição Café das Mulheres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo-iaf.webp" />
        <link rel="icon" href="/logo-iaf.webp" type="image/webp" sizes="32x32" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SnowfallCanvas from "@/components/SnowfallCanvas";
import GlowOrbs from "@/components/GlowOrbs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nixorath Dashboard",
  description: "Manage the Nixorath Discord bot for your server.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full text-foreground">
        <GlowOrbs />
        <SnowfallCanvas />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}

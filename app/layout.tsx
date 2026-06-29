import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Reel — discover before you commit",
  description:
    "A vertical-scroll discovery feed for streaming. Preview titles in short form, read the room, then commit to watch.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark h-full", inter.variable, "font-sans antialiased")}
    >
      <body className="bg-background text-foreground h-full overflow-hidden overscroll-none">
        {children}
      </body>
    </html>
  );
}

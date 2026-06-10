import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: {
    default: "Sports Calendar 體育賽事日曆",
    template: "%s | Sports Calendar",
  },
  description: "整合足球、籃球、棒球、賽車與單車賽事的個人體育行事曆。",
  applicationName: "Sports Calendar 體育賽事日曆",
  metadataBase: new URL("https://sports-calendar.vercel.app"),
  openGraph: {
    title: "Sports Calendar 體育賽事日曆",
    description: "整合足球、籃球、棒球、賽車與單車賽事的極簡日曆工具。",
    type: "website",
    url: "https://sports-calendar.vercel.app",
    siteName: "Sports Calendar 體育賽事日曆",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

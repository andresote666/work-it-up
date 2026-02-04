import type { Metadata, Viewport } from "next";
import { Rubik_Mono_One, Chakra_Petch } from "next/font/google";
import "./globals.css";

const rubikMonoOne = Rubik_Mono_One({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const chakraPetch = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Work It Up",
  description: "Show up. Log it. Build momentum.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Work It Up",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#CCFF00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${rubikMonoOne.variable} ${chakraPetch.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

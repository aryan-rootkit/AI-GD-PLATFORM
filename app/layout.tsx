import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import {
  ATHENA_DESCRIPTION,
  ATHENA_NAME,
  ATHENA_TAGLINE,
} from "@/lib/branding";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: ATHENA_NAME,
    template: `%s | ${ATHENA_NAME}`,
  },
  description: ATHENA_DESCRIPTION,
  applicationName: ATHENA_NAME,
  keywords: [
    "ATHENA",
    "mock interview",
    "group discussion",
    "communication training",
    "AI evaluation",
    "interview preparation",
    "college students",
  ],
  icons: {
    icon: [{ url: "/athena-logo.png", type: "image/png" }],
    apple: "/athena-logo.png",
    shortcut: "/athena-logo.png",
  },
  openGraph: {
    title: `${ATHENA_NAME} — ${ATHENA_TAGLINE}`,
    description: ATHENA_DESCRIPTION,
    type: "website",
    images: [{ url: "/athena-logo.png", width: 512, height: 512, alt: ATHENA_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: ATHENA_NAME,
    description: ATHENA_DESCRIPTION,
    images: ["/athena-logo.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased pattern`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

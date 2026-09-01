import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PrintDrop — Send it. We'll print it.",
  description:
    "Send your photos and documents for printing in seconds. No account needed—just choose your files and add optional print notes.",
  applicationName: "PrintDrop",
  openGraph: {
    title: "PrintDrop — Send it. We'll print it.",
    description:
      "Upload your photos and documents for printing in under a minute. No account needed.",
    type: "website",
    siteName: "PrintDrop",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrintDrop — Send it. We'll print it.",
    description:
      "Upload your photos and documents for printing in under a minute. No account needed.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}

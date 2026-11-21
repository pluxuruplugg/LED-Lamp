import type { Metadata } from "next";
import { getSiteUrl, siteTitle, siteDescription } from "@/lib/site";
import "./globals.css";
import { VisitTracker } from "@/components/visit-tracker";

const siteUrl = getSiteUrl();
const socialImage = siteUrl ? [{ url: new URL("/images/land8.jpg", siteUrl).href, width: 1206, height: 1190, alt: "Аварійна LED-лампа FAE-3920 з упаковкою" }] : undefined;

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  ...(siteUrl ? { metadataBase: siteUrl, alternates: { canonical: siteUrl.href } } : {}),
  openGraph: {
    type: "website", locale: "uk_UA", siteName: "Аварійна LED-лампа FAE-3920",
    title: siteTitle, description: siteDescription,
    ...(siteUrl ? { url: siteUrl.href, images: socialImage } : {}),
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, ...(socialImage ? { images: socialImage } : {}) },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}<VisitTracker /></body>
    </html>
  );
}

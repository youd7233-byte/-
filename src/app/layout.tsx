import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hirafidz.vercel.app"),
  title: {
    default: "حِرَفي (Hirafidz) | منصة الحرفيين الأولى في الجزائر",
    template: "%s | حِرَفي (Hirafidz)",
  },
  description: "تواصل مع أمهر الحرفيين في منطقتك بالجزائر. نجارة، كهرباء، سباكة، بناء، طلاء وأكثر (Hirafi).",
  keywords: ["حرفي", "Hirafi", "Hirafidz", "حرفيين الجزائر", "سباك", "كهربائي", "بناء", "نجار", "الجزائر", "artisan algerie", "services algerie"],
  authors: [{ name: "Hirafi Team" }],
  openGraph: {
    title: "حِرَفي (Hirafidz) | منصة الحرفيين الأولى في الجزائر",
    description: "تواصل مع أمهر الحرفيين في منطقتك بالجزائر بسرعة وسهولة.",
    url: "https://hirafidz.vercel.app",
    siteName: "حِرَفي (Hirafidz)",
    locale: "ar_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "حِرَفي (Hirafidz) | منصة الحرفيين الأولى في الجزائر",
    description: "تواصل مع أمهر الحرفيين في منطقتك بالجزائر بسرعة وسهولة.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBF6EC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

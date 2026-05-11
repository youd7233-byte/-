import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "حِرَفي — منصة الحرفيين الأولى في الجزائر",
  description: "تواصل مع أمهر الحرفيين في منطقتك. نجارة، كهرباء، سباكة، بناء وأكثر.",
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

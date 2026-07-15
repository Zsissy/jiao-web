import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jiao's Living Archive",
  description: "一个记录学习、爱情和未来计划的个人网站。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Jiao's Living Archive",
    description: "学习、相爱、计划未来。",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "1280",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

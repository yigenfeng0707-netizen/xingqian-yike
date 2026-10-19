import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "行前一刻 · ACC 2026 AI+生活·智慧出行",
  description:
    "出门前 30 秒，根据目的地、出发约束、天气与交通偏好，生成唯一推荐行动，延误时自动改线。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-slate-50 to-slate-100">
          <Nav />
          <main>{children}</main>
          <footer className="border-t border-slate-200/80 bg-white/50 py-8 text-center text-xs text-slate-500">
            行前一刻 · ACC 2026 Time to Build · 赛道 AI+生活 · 智慧出行 · MIT
          </footer>
        </div>
      </body>
    </html>
  );
}

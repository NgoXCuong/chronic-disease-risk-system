import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedRisk AI — Hệ thống Sàng lọc & Theo dõi Nguy cơ Bệnh Mạn tính",
  description:
    "Hệ thống web hỗ trợ sàng lọc và theo dõi nguy cơ một số bệnh mạn tính không lây nhiễm bằng Machine Learning & Giải thích XAI (SHAP).",
  keywords: [
    "sàng lọc bệnh mạn tính",
    "tiểu đường",
    "tăng huyết áp",
    "tim mạch",
    "đột quỵ",
    "machine learning y tế",
    "xai shap",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`h-full scroll-smooth scroll-pt-16 ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('medrisk-theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && systemDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased flex flex-col font-sans transition-colors duration-200 ${inter.className}`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ChatFloatingButton } from "@/components/chat/ChatFloatingButton";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Hệ thống Sàng lọc & Theo dõi Nguy cơ Bệnh Mạn tính (CDSS)",
  description:
    "Ứng dụng Machine Learning hỗ trợ đánh giá nguy cơ Tiểu đường, Tăng huyết áp, Tim mạch, Đột quỵ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <TooltipProvider>
          <AuthProvider>
            {children}
            {/* Thông báo nổi Sonner */}
            <Toaster position="top-right" richColors closeButton />
            {/* Nút Trợ lý Y tế AI nổi cố định toàn ứng dụng */}
            <ChatFloatingButton />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

import React from "react";
import { Metadata } from "next";
import { AuthBrandingPanel } from "@/components/auth/AuthBrandingPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập | Hệ thống Sàng lọc Nguy cơ Bệnh Mạn tính",
  description: "Đăng nhập vào hệ thống hỗ trợ ra quyết định lâm sàng và theo dõi sức khỏe.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Cột trái: Khối thương hiệu y tế CDSS (Ẩn trên mobile) */}
      <AuthBrandingPanel />

      {/* Cột phải: Form Đăng nhập */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 py-8 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-lg lg:max-w-xl bg-white dark:bg-slate-900 p-8 sm:p-10 lg:p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <AuthMobileHeader
            title="Đăng nhập Tài khoản"
            subtitle="Truy cập hồ sơ sức khỏe và bắt đầu đợt sàng lọc nguy cơ."
          />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

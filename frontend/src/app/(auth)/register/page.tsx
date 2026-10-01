import React from "react";
import { Metadata } from "next";
import { AuthBrandingPanel } from "@/components/auth/AuthBrandingPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký Hồ sơ Sức khỏe | Hệ thống Sàng lọc Nguy cơ Bệnh Mạn tính",
  description: "Khởi tạo tài khoản và hồ sơ thể chất ban đầu để theo dõi nguy cơ bệnh.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Cột trái: Khối thương hiệu y tế CDSS (Ẩn trên mobile) */}
      <AuthBrandingPanel className="lg:w-5/12 xl:w-4/12" />

      {/* Cột phải: Form Đăng ký 2 cột */}
      <div className="flex w-full lg:w-7/12 xl:w-8/12 flex-col justify-center px-4 py-8 sm:px-6 md:px-10 lg:px-8 xl:px-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none my-auto">
          <AuthMobileHeader
            title="Đăng ký Hồ sơ Y tế"
            subtitle="Tạo tài khoản để lưu trữ kết quả và theo dõi biến thiên nguy cơ bệnh qua thời gian."
          />
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

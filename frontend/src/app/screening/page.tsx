import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScreeningWizard } from "@/components/screening/ScreeningWizard";
import { HeartPulse } from "lucide-react";

export const metadata: Metadata = {
  title: "Khảo sát Sàng lọc Nguy cơ Bệnh Mạn tính | ChronicCare CDSS",
  description:
    "Đánh giá sớm nguy cơ mắc Đái tháo đường, Tăng huyết áp, Tim mạch và Đột quỵ qua 5 mô hình Machine Learning.",
};

export default function ScreeningPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Trang Sàng lọc */}
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1 border border-teal-200/60 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold">
              <HeartPulse className="h-3.5 w-3.5 text-teal-600" />
              <span>Sàng lọc Toàn diện Tầng 1 (CDC BRFSS)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Khảo sát Nguy cơ Bệnh Mạn tính
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Biểu mẫu khảo sát thông minh (~18 câu hỏi) hỗ trợ đánh giá đồng thời nguy cơ tiềm ẩn của 4 bệnh không lây nhiễm: Đái tháo đường, Tăng huyết áp, Tim mạch và Đột quỵ.
            </p>
          </div>

          {/* Form Wizard Đa bước */}
          <ScreeningWizard />
        </div>
      </main>

      <Footer />
    </div>
  );
}

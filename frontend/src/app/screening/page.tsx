import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScreeningWizard } from "@/components/screening/ScreeningWizard";
import { HeartPulse, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Khảo sát Sàng lọc Nguy cơ Bệnh Mạn tính | ChronicCare CDSS",
  description:
    "Đánh giá sớm nguy cơ mắc Đái tháo đường, Tăng huyết áp, Tim mạch và Đột quỵ qua 5 mô hình Machine Learning.",
};

export default function ScreeningPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Trang Sàng lọc Y tế */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 px-4 py-1.5 border border-teal-200/80 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold shadow-xs">
              <Cpu className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
              <span>Hệ thống CDSS • Suy luận Trí tuệ Nhân tạo Đa tầng</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Khảo sát Sàng lọc Sớm Nguy cơ Bệnh Mạn tính
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Biểu mẫu khảo sát dịch tễ thông minh (~18 chỉ số) hỗ trợ tính toán đồng thời nguy cơ tiềm ẩn của 4 bệnh không lây nhiễm: <strong>Đái tháo đường Týp 2, Tăng huyết áp, Bệnh tim mạch & Đột quỵ</strong> dựa trên mô hình máy học đã hiệu chuẩn xác suất.
            </p>

            {/* Các tag tính năng khoa học */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                Chuẩn dữ liệu CDC BRFSS
              </span>
              <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                Giải thích nguyên nhân bằng SHAP XAI
              </span>
              <span className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                Độ nhạy sàng lọc (Recall) &ge; 85%
              </span>
            </div>
          </div>

          {/* Form Wizard Đa bước */}
          <ScreeningWizard />
        </div>
      </main>

      <Footer />
    </div>
  );
}

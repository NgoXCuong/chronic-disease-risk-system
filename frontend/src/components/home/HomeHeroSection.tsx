"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeHeroSectionProps {
  loading: boolean;
  modelsCount: number;
}

export function HomeHeroSection({ loading, modelsCount }: HomeHeroSectionProps) {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-medical-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* CDSS Clinical Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-100 border border-medical-200 text-medical-800 dark:bg-medical-950/80 dark:border-medical-800 dark:text-medical-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-medical-600 dark:text-medical-400" />
          Hệ thống Hỗ trợ Ra Quyết định Y tế (CDSS)
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Chủ động Sàng lọc &amp; Theo dõi Nguy cơ{" "}
          <span className="text-medical-600 dark:text-medical-400">Bệnh Mạn tính</span> bằng AI
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Ứng dụng các mô hình Machine Learning tiên tiến đã hiệu chuẩn xác suất lâm sàng 
          kết hợp kỹ thuật giải thích minh bạch <strong>TreeSHAP (XAI)</strong> để nhận diện sớm nguy cơ 
          và cung cấp khuyến nghị điều chỉnh lối sống kịp thời.
        </p>

        {/* CTA Buttons (Touch target >= 44px on mobile) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full min-h-[44px] gap-2 text-base shadow-md">
              Bắt đầu Khảo sát Nguy cơ
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full min-h-[44px] text-base">
              Tìm hiểu Mô hình
            </Button>
          </Link>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-12 sm:mt-16 pt-8 border-t border-slate-200/80 dark:border-slate-800">
          <div className="p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-medical-600 dark:text-medical-400">
              {loading ? "..." : modelsCount || "5"}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mt-1">
              Mô hình Chuyên biệt
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ≥ 80%
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mt-1">
              Độ nhạy Sàng lọc (Recall)
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
              &lt; 1ms
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mt-1">
              Giải thích SHAP Tức thì
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              100%
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mt-1">
              Bảo mật Hồ sơ Y tế
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

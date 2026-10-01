"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  RotateCcw,
  LayoutDashboard,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiseasePrediction } from "@/types/screening";
import { DiseaseResultCard } from "@/components/screening/DiseaseResultCard";

export default function ScreeningResultPage() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Record<string, DiseasePrediction> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("last_screening_result");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPredictions(parsed);
        } catch {
          // Lỗi parse
        }
      }
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <HeartPulse className="h-10 w-10 text-teal-600 animate-pulse mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Đang tải kết quả phân tích AI...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!predictions || Object.keys(predictions).length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 mx-auto">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Chưa có kết quả sàng lọc
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn chưa thực hiện đợt đánh giá nào gần đây. Hãy hoàn thành bảng khảo sát để mô hình AI phân tích nguy cơ sức khỏe.
            </p>
            <Link href="/screening" className="block pt-2">
              <Button className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2">
                Bắt đầu Sàng lọc Ngay <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Thống kê nhanh số bệnh nguy cơ cao
  const highRiskCount = Object.values(predictions).filter((p) => p.risk_level === "HIGH").length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Báo cáo Kết quả */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1 border border-teal-200/60 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2">
                <HeartPulse className="h-3.5 w-3.5 text-teal-600" />
                <span>Báo cáo Sàng lọc Lâm sàng Toàn diện</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Kết quả Đánh giá Nguy cơ Bệnh
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Phân tích bởi 5 mô hình Machine Learning & Giải thích đóng góp đa chiều TreeSHAP XAI.
              </p>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center gap-2">
              <Link href="/screening">
                <Button variant="outline" className="h-10 rounded-xl text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800">
                  <RotateCcw className="h-3.5 w-3.5" /> Khảo sát lại
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1.5 shadow-sm">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Bảng điều khiển
                </Button>
              </Link>
            </div>
          </div>

          {/* Banner Tóm tắt Tình trạng */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-4 ${
              highRiskCount > 0
                ? "bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 text-rose-900 dark:text-rose-200"
                : "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200"
            }`}
          >
            <ShieldAlert className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">
                {highRiskCount > 0
                  ? `Cảnh báo: Phát hiện ${highRiskCount} bệnh lý ở mức NGUY CƠ CAO`
                  : "Tích cực: Các chỉ số đang ở mức Nguy cơ Thấp & Kiểm soát tốt"}
              </h3>
              <p className="text-xs mt-1 opacity-80 leading-relaxed">
                {highRiskCount > 0
                  ? "Bạn nên tham khảo ý kiến của bác sĩ chuyên khoa để được thực hiện các xét nghiệm sinh hóa chuyên sâu và xây dựng kế hoạch can thiệp sớm."
                  : "Hãy tiếp tục duy trì chế độ dinh dưỡng lành mạnh, vận động thể chất đều đặn và kiểm tra sức khỏe định kỳ mỗi 6-12 tháng."}
              </p>
            </div>
          </div>

          {/* Tabs Chi tiết 4 Bệnh Mạn tính */}
          <Tabs defaultValue="diabetes_binary" className="w-full space-y-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 gap-1">
              <TabsTrigger value="diabetes_binary" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xs">
                Đái tháo đường
              </TabsTrigger>
              <TabsTrigger value="hypertension" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xs">
                Tăng huyết áp
              </TabsTrigger>
              <TabsTrigger value="cardiovascular" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xs">
                Tim mạch
              </TabsTrigger>
              <TabsTrigger value="stroke" className="rounded-xl py-2.5 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xs">
                Đột quỵ
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Đái tháo đường */}
            <TabsContent value="diabetes_binary">
              {predictions["diabetes_binary"] && (
                <DiseaseResultCard prediction={predictions["diabetes_binary"]} />
              )}
            </TabsContent>

            {/* Tab 2: Tăng huyết áp */}
            <TabsContent value="hypertension">
              {predictions["hypertension"] && (
                <DiseaseResultCard prediction={predictions["hypertension"]} />
              )}
            </TabsContent>

            {/* Tab 3: Tim mạch */}
            <TabsContent value="cardiovascular">
              {predictions["cardiovascular"] && (
                <DiseaseResultCard prediction={predictions["cardiovascular"]} />
              )}
            </TabsContent>

            {/* Tab 4: Đột quỵ */}
            <TabsContent value="stroke">
              {predictions["stroke"] && (
                <DiseaseResultCard prediction={predictions["stroke"]} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

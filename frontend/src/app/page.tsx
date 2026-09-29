"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  FileText,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/common/Navbar";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { api } from "@/lib/api";
import { LoadedModel } from "@/types/screening";

export default function HomePage() {
  const [models, setModels] = React.useState<LoadedModel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        // Nạp dữ liệu mô hình thực tế từ Backend qua Axios client
        const res = await api.get<LoadedModel[]>("/screening/models");
        setModels(res.data);
      } catch (err: any) {
        console.warn("Lỗi tải thông tin mô hình từ Backend qua Axios:", err?.response?.data || err.message);
        setError("Chưa kết nối được máy chủ AI backend. Vui lòng đảm bảo Backend FastAPI đang chạy.");
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  // Ánh xạ icon và huy hiệu chuyên môn theo mã định danh bệnh lý
  const getDiseaseMetadata = (diseaseKey: string, featuresCount: number) => {
    switch (diseaseKey) {
      case "diabetes_binary":
        return {
          icon: Activity,
          badge: "Sàng lọc Lối sống CDC",
          desc: "Đánh giá nguy cơ kháng insulin và rối loạn chuyển hóa đường từ 21 chỉ số sinh hoạt.",
        };
      case "hypertension":
        return {
          icon: Stethoscope,
          badge: "Sàng lọc Lối sống CDC",
          desc: "Phát hiện sớm nguy cơ tăng áp lực thành mạch mạn tính từ lối sống và thể trạng.",
        };
      case "cardiovascular":
        return {
          icon: HeartPulse,
          badge: "Sàng lọc Lối sống CDC",
          desc: "Sàng lọc nguy cơ biến cố nhồi máu cơ tim, xơ vữa động mạch và bệnh tim thiếu máu.",
        };
      case "stroke":
        return {
          icon: BrainCircuit,
          badge: "Sàng lọc Lối sống CDC",
          desc: "Cảnh báo sớm nguy cơ tai biến mạch máu não qua tiền sử tăng huyết áp và lipid máu.",
        };
      case "diabetes_clinical":
        return {
          icon: FileText,
          badge: "Xét nghiệm Lâm sàng Pima",
          desc: "Dành cho người đã có xét nghiệm sinh hóa máu định kỳ (Glucose đói, Insulin, Huyết áp).",
        };
      default:
        return {
          icon: Activity,
          badge: featuresCount <= 8 ? "Xét nghiệm Lâm sàng" : "Sàng lọc Lối sống",
          desc: "Mô hình học máy chuyên sâu phát hiện sớm nguy cơ bệnh mạn tính.",
        };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Legal Notice Banner */}
      <MedicalDisclaimer variant="banner" />

      {/* Main Responsive Navbar with Theme Toggle */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
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
                <Button size="lg" className="w-full gap-2 text-base shadow-md">
                  Bắt đầu Khảo sát Nguy cơ
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-base">
                  Tìm hiểu Mô hình
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mt-12 sm:mt-16 pt-8 border-t border-slate-200/80 dark:border-slate-800">
              <div className="p-4 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-medical-600 dark:text-medical-400">
                  {loading ? "..." : models.length || "5"}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mt-1">
                  Mô hình AI Chuyên biệt
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
                  Bảo mật Dữ liệu (RLS)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Disease Modules Section */}
        <section id="features" className="py-14 sm:py-20 lg:py-24 bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-medical-600 dark:text-medical-400">
                Phân hệ Sàng lọc Chuyên biệt
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                Đánh giá Nguy cơ 5 Bệnh lý Mạn tính Không lây
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Hệ thống áp dụng ngưỡng cắt tối ưu (Youden&apos;s J) giúp tối đa hóa khả năng phát hiện sớm người có nguy cơ cao.
              </p>
            </div>

            {/* Skeleton Loading State khi đang truy vấn dữ liệu thật từ Backend */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Card key={item} className="flex flex-col justify-between p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <Skeleton className="w-24 h-5 rounded-full" />
                    </div>
                    <Skeleton className="w-3/4 h-6 rounded" />
                    <Skeleton className="w-full h-12 rounded" />
                    <Skeleton className="w-full h-4 rounded mt-4" />
                  </Card>
                ))}
              </div>
            )}

            {/* Thông báo nếu Backend chưa khởi động */}
            {!loading && error && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm text-center max-w-xl mx-auto">
                {error}
              </div>
            )}

            {/* Hiển thị danh sách mô hình thực tế nạp từ Backend */}
            {!loading && models.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {models.map((m) => {
                  const meta = getDiseaseMetadata(m.disease, m.features_count);
                  const IconComp = meta.icon;
                  const cutoffPct = (m.optimal_threshold * 100).toFixed(1);
                  const recallPct = (
                    ((m.metrics?.test_recall ?? m.metrics?.recall ?? 0.8) * 100)
                  ).toFixed(1);

                  return (
                    <Card
                      key={m.disease}
                      className="hover:border-medical-300 dark:hover:border-medical-600 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-medical-50 dark:bg-medical-950/80 border border-medical-100 dark:border-medical-800 flex items-center justify-center text-medical-600 dark:text-medical-400 group-hover:scale-105 transition-transform">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">
                            {meta.badge}
                          </span>
                        </div>
                        <CardTitle className="text-base sm:text-lg">
                          {m.disease_name_vi.split("(")[0].trim()}
                        </CardTitle>
                        <CardDescription className="leading-relaxed mt-2">
                          {meta.desc}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          <span>
                            Ngưỡng Youden&apos;s J: <strong>{cutoffPct}%</strong>
                          </span>
                          <span>
                            Độ nhạy Recall:{" "}
                            <strong className="text-emerald-600 dark:text-emerald-400">
                              {recallPct}%
                            </strong>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Legal Disclaimer Box Section */}
        <section className="py-12 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/60 dark:border-slate-800/80 transition-colors">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <MedicalDisclaimer />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MedRisk AI — Đồ án Tốt nghiệp Đại học ngành Công nghệ Thông tin.</p>
          <p className="text-slate-400 dark:text-slate-500">
            Hệ thống hỗ trợ ra quyết định lâm sàng (CDSS) cá nhân hóa.
          </p>
        </div>
      </footer>
    </div>
  );
}

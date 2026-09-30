"use client";

import * as React from "react";
import {
  Activity,
  BrainCircuit,
  FileText,
  HeartPulse,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadedModel } from "@/types/screening";

interface HomeModelsSectionProps {
  loading: boolean;
  error: string | null;
  models: LoadedModel[];
}

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

export function HomeModelsSection({ loading, error, models }: HomeModelsSectionProps) {
  return (
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
            Hệ thống áp dụng ngưỡng cảnh báo lâm sàng tối ưu giúp phát hiện sớm người có nguy cơ cao.
          </p>
        </div>

        {/* Skeleton Loading State khi đang nạp dữ liệu từ Backend */}
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

        {/* Danh sách mô hình AI thực tế */}
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
                        Ngưỡng cảnh báo: <strong>{cutoffPct}%</strong>
                      </span>
                      <span>
                        Độ nhạy (Recall):{" "}
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
  );
}

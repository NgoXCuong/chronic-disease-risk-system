import * as React from "react";
import { Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadedModel } from "@/types/screening";

interface AIModelsGridProps {
  loading: boolean;
  models: LoadedModel[];
}

export function AIModelsGrid({ loading, models }: AIModelsGridProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-medical-600" />
          5 Mô hình AI Đã Nạp &amp; Hiệu chuẩn Xác suất
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Thông số kỹ thuật và độ nhạy lâm sàng được nạp trực tiếp từ RAM Backend FastAPI
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </>
        ) : (
          models.map((m) => (
            <Card
              key={m.disease}
              className="shadow-sm border-slate-200/80 dark:border-slate-800 hover:border-medical-300 dark:hover:border-medical-700 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {m.disease_name_vi}
                  </CardTitle>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    {m.features_count} đặc trưng
                  </span>
                </div>
                <CardDescription className="text-xs mt-1">
                  {m.model_type.replace(/_/g, " ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Ngưỡng phân loại Youden&apos;s J:</span>
                  <strong className="text-slate-900 dark:text-slate-200">
                    {(m.optimal_threshold * 100).toFixed(1)}%
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Độ nhạy Test Recall (Chống bỏ sót):</span>
                  <strong className="text-medical-600 dark:text-medical-400">
                    {m.metrics.test_recall ? `${(m.metrics.test_recall * 100).toFixed(1)}%` : "---"}
                  </strong>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import * as React from "react";
import Link from "next/link";
import { Calendar, FileText, Sparkles, Stethoscope, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/common/RiskBadge";

interface LatestScreeningCardProps {
  loading: boolean;
  latestRecord?: any;
  totalRecords: number;
}

export function LatestScreeningCard({
  loading,
  latestRecord,
  totalRecords,
}: LatestScreeningCardProps) {
  return (
    <div className="space-y-4 mb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-medical-600" />
          Kết quả Sàng lọc Gần nhất
        </h2>
        {totalRecords > 0 && (
          <Link
            href="/history"
            className="text-xs font-semibold text-medical-600 dark:text-medical-400 hover:underline"
          >
            Xem toàn bộ lịch sử ({totalRecords}) →
          </Link>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-44 w-full rounded-2xl" />
      ) : latestRecord ? (
        <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-medical-100 dark:bg-medical-950/80 text-medical-800 dark:text-medical-300">
                  {latestRecord.record_type === "LIFESTYLE_BRFSS" ? "Sàng lọc Lối sống CDC" : "Lâm sàng"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(latestRecord.recorded_at).toLocaleString("vi-VN")}
                </span>
              </div>
              <Link href={`/history/${latestRecord.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  Xem chi tiết &amp; Giải thích SHAP
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {latestRecord.results.map((res: any) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 line-clamp-1 mb-1.5">
                      {res.disease_name_vi || res.disease}
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                      {(res.risk_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Phân tầng:</span>
                    <RiskBadge level={res.risk_level} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center p-8 sm:p-12 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
          <div className="w-14 h-14 rounded-2xl bg-medical-50 dark:bg-medical-950/80 text-medical-600 dark:text-medical-400 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Bạn chưa thực hiện đợt sàng lọc nguy cơ nào
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Chỉ mất khoảng 3 - 5 phút hoàn thành khảo sát 21 chỉ số lối sống CDC để nhận phân tích nguy cơ kèm giải thích SHAP.
          </p>
          <Link href="/screening">
            <Button size="lg" className="gap-2 shadow-md">
              <Sparkles className="w-4 h-4" />
              Bắt đầu Khảo sát Ngay
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}

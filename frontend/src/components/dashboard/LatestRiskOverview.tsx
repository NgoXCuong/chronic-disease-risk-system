import React from "react";
import Link from "next/link";
import { Activity, Heart, Droplets, Brain, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScreeningHistoryItem } from "@/types/screening";

interface Props {
  latestRecord?: ScreeningHistoryItem | null;
}

const DISEASE_META: Record<string, { name: string; icon: React.ElementType; desc: string }> = {
  diabetes_binary: { name: "Đái tháo đường Týp 2", icon: Droplets, desc: "Nguy cơ rối loạn chuyển hóa đường huyết" },
  hypertension: { name: "Tăng huyết áp", icon: Activity, desc: "Áp lực dòng máu lên thành động mạch" },
  cardiovascular: { name: "Bệnh tim mạch vành", icon: Heart, desc: "Nguy cơ xơ vữa & nhồi máu cơ tim" },
  stroke: { name: "Đột quỵ não", icon: Brain, desc: "Nguy cơ thiếu máu cục bộ hoặc xuất huyết não" },
};

const RISK_BADGE: Record<string, { label: string; style: string }> = {
  LOW: { label: "Nguy cơ Thấp", style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400" },
  MEDIUM: { label: "Nguy cơ Trung bình", style: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400" },
  HIGH: { label: "Nguy cơ Cao", style: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400" },
};

export function LatestRiskOverview({ latestRecord }: Props) {
  if (!latestRecord || !latestRecord.screened_diseases?.length) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-xs">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Chưa có kết quả sàng lọc nguy cơ</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Hãy hoàn thành bài khảo sát sức khỏe lối sống để hệ thống AI đánh giá rủi ro 4 bệnh mạn tính chính.
          </p>
        </div>
        <Link href="/screening">
          <Button className="h-11 min-h-[44px] px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20">
            Khảo sát ngay bây giờ
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Kết quả Sàng lọc Gần nhất</span>
          <span className="text-[11px] font-normal text-slate-400">
            ({new Date(latestRecord.created_at).toLocaleDateString("vi-VN")})
          </span>
        </h2>
        <Link href={`/screening/result`}>
          <span className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 cursor-pointer">
            Chi tiết XAI <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {latestRecord.screened_diseases.map((d) => {
          const meta = DISEASE_META[d.disease] || { name: d.disease, icon: Activity, desc: "Bệnh lý mạn tính" };
          const badge = RISK_BADGE[d.risk_level] || RISK_BADGE.LOW;
          const scorePercent = Math.round(d.score * 100);

          return (
            <div key={d.disease} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <meta.icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${badge.style}`}>
                    {badge.label}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{meta.name}</h3>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{meta.desc}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">Điểm xác suất rủi ro</span>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100">{scorePercent}%</span>
                </div>
                {d.risk_level === "HIGH" && (
                  <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Vượt ngưỡng
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

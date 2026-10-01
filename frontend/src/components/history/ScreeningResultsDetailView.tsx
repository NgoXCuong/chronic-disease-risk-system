"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { HealthRecordDetailResponse } from "@/types/screening";
import { AlertCircle, Activity, Sparkles } from "lucide-react";

interface Props {
  record: HealthRecordDetailResponse;
}

const RISK_BADGES: Record<string, { label: string; style: string }> = {
  LOW: { label: "Nguy cơ Thấp", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MEDIUM: { label: "Trung bình", style: "bg-amber-50 text-amber-800 border-amber-200" },
  HIGH: { label: "Nguy cơ Cao", style: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function ScreeningResultsDetailView({ record }: Props) {
  return (
    <div className="space-y-4 py-2">
      {/* Thông số nhân trắc học */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-teal-600" /> Thông số khảo sát đầu vào
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {Object.entries(record.input_data).slice(0, 8).map(([key, val]) => (
            <div key={key} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block truncate">{key}</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danh sách kết quả từng bệnh */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Kết quả Đánh giá Mô hình Machine Learning ({record.screening_results.length} bệnh)
        </h4>
        {record.screening_results.map((sr) => {
          const badge = RISK_BADGES[sr.risk_level] || RISK_BADGES.LOW;
          return (
            <div key={sr.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{sr.disease_name_vi}</span>
                  <span className="text-[10px] text-slate-400 ml-2">Ngưỡng: {sr.optimal_threshold}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-teal-600">{sr.risk_percentage.toFixed(1)}%</span>
                  <Badge variant="outline" className={`text-[10px] font-bold ${badge.style}`}>{badge.label}</Badge>
                </div>
              </div>

              {/* Giải thích SHAP XAI */}
              {sr.top_risk_factors && sr.top_risk_factors.length > 0 && (
                <div className="p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100/60 dark:border-teal-900/40 text-[11px] space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-teal-800 dark:text-teal-300">
                    <Sparkles className="h-3 w-3 text-teal-600" /> Yếu tố ảnh hưởng chính (TreeSHAP):
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {sr.top_risk_factors.slice(0, 3).map((f, fi) => (
                      <span key={fi} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-[10px] text-slate-700 dark:text-slate-300">
                        <b>{f.feature_name_vi || f.feature}</b>: {f.impact}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Khuyến nghị */}
              {sr.recommendations && sr.recommendations.length > 0 && (
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Khuyến nghị: </span>
                  {sr.recommendations[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

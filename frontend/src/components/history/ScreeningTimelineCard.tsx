"use client";

import React from "react";
import { Calendar, FileDown, Eye, Loader2, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScreeningHistoryItem } from "@/types/screening";

interface Props {
  item: ScreeningHistoryItem;
  onViewDetail: (recordId: string) => void;
  onDownloadPdf: (recordId: string) => void;
  isDownloading: boolean;
}

const RISK_BADGES: Record<string, { label: string; style: string }> = {
  LOW: { label: "Nguy cơ Thấp", style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400" },
  MEDIUM: { label: "Trung bình", style: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400" },
  HIGH: { label: "Nguy cơ Cao", style: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400" },
};

export function ScreeningTimelineCard({ item, onViewDetail, onDownloadPdf, isDownloading }: Props) {
  const dateFormatted = new Date(item.created_at).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const maxRisk = RISK_BADGES[item.highest_risk_level] || RISK_BADGES.LOW;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-300 dark:hover:border-teal-700/60 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Khảo sát #{item.record_id.slice(0, 8)}
              </span>
              <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600">
                {item.record_type === "CLINICAL_PIMA" ? "Xét nghiệm lâm sàng" : "Khảo sát lối sống"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <Calendar className="h-3 w-3" />
              <span>{dateFormatted}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge variant="outline" className={`text-xs font-bold ${maxRisk.style}`}>
            Mức cao nhất: {maxRisk.label} ({Math.round(item.highest_risk_score * 100)}%)
          </Badge>
        </div>
      </div>

      {item.notes && (
        <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
          "{item.notes}"
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {item.screened_diseases.map((d, i) => {
          const b = RISK_BADGES[d.risk_level] || RISK_BADGES.LOW;
          const score = Math.round((d.risk_percentage || (d.risk_score ? d.risk_score * 100 : 0)));
          return (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                {d.disease_name_vi || d.disease}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{score}%</span>
                <Badge variant="outline" className={`text-[9px] py-0 px-1.5 font-bold ${b.style}`}>
                  {b.label.replace("Nguy cơ ", "")}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(item.record_id)}
          className="h-9 px-3 rounded-xl text-xs font-semibold hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
        >
          <Eye className="h-3.5 w-3.5 mr-1.5 text-teal-600" /> Xem chi tiết
        </Button>
        <Button
          variant="default"
          size="sm"
          disabled={isDownloading}
          onClick={() => onDownloadPdf(item.record_id)}
          className="h-9 px-3 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
        >
          {isDownloading ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Đang tạo PDF...</>
          ) : (
            <><FileDown className="h-3.5 w-3.5 mr-1.5" /> Xuất PDF báo cáo</>
          )}
        </Button>
      </div>
    </div>
  );
}

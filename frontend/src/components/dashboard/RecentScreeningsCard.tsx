import React from "react";
import Link from "next/link";
import { History, Calendar, ArrowRight, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScreeningHistoryItem } from "@/types/screening";

interface Props {
  records: ScreeningHistoryItem[];
}

const RISK_BADGE: Record<string, { label: string; style: string }> = {
  LOW: { label: "Thấp", style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400" },
  MEDIUM: { label: "Trung bình", style: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400" },
  HIGH: { label: "Cao", style: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400" },
};

export function RecentScreeningsCard({ records }: Props) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <History className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Các Lần Khảo Sát Gần Đây</h2>
        </div>
        <Link href="/history">
          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg">
            Xem tất cả <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {!records.length ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          <ClipboardCheck className="h-7 w-7 mx-auto mb-1.5 opacity-60" />
          Chưa có lịch sử khảo sát nào được ghi nhận.
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.slice(0, 4).map((rec) => {
            const badge = RISK_BADGE[rec.highest_risk_level] || RISK_BADGE.LOW;
            const highestScore = Math.round(rec.highest_risk_score * 100);

            return (
              <div
                key={rec.record_id}
                className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-teal-200 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(rec.created_at).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • {rec.diseases_count} bệnh lý
                    </span>
                  </div>
                  {rec.notes && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      "{rec.notes}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <Badge variant="outline" className={`text-[10px] font-bold ${badge.style}`}>
                    {badge.label} ({highestScore}%)
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { RiskTrajectoryPoint } from "@/types/screening";

interface Props {
  points: RiskTrajectoryPoint[];
  threshold: number;
}

const RISK_BADGES: Record<string, { label: string; style: string }> = {
  LOW: { label: "Thấp", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  MEDIUM: { label: "Trung bình", style: "bg-amber-50 text-amber-800 border-amber-200" },
  HIGH: { label: "Cao", style: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function TrajectoryDeltaTable({ points, threshold }: Props) {
  const thresholdPct = threshold <= 1 ? Math.round(threshold * 1000) / 10 : threshold;

  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
          <TableRow className="text-xs">
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Đợt khảo sát</TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Thời gian</TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Mức nguy cơ (%)</TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Phân tầng</TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Biến thiên (Delta Δ)</TableHead>
            <TableHead className="font-bold text-slate-700 dark:text-slate-300">Đánh giá xu hướng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs">
          {points.map((pt, i) => {
            const badge = RISK_BADGES[pt.risk_level] || RISK_BADGES.LOW;
            const deltaPct = pt.delta_risk !== null && pt.delta_risk !== undefined ? Math.round(pt.delta_risk * 1000) / 10 : null;
            const isAbove = pt.risk_percentage >= thresholdPct;

            return (
              <TableRow key={pt.screening_result_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">#{i + 1}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {new Date(pt.recorded_at).toLocaleDateString("vi-VN", { dateStyle: "medium" })}
                </TableCell>
                <TableCell className="font-extrabold text-teal-600 dark:text-teal-400">
                  {pt.risk_percentage}%
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] font-bold ${badge.style}`}>{badge.label}</Badge>
                </TableCell>
                <TableCell>
                  {deltaPct === null ? (
                    <span className="text-slate-400">Mốc gốc</span>
                  ) : deltaPct > 0 ? (
                    <span className="text-rose-600 font-bold flex items-center gap-0.5">
                      <TrendingUp className="h-3.5 w-3.5" /> +{deltaPct}%
                    </span>
                  ) : deltaPct < 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <TrendingDown className="h-3.5 w-3.5" /> {deltaPct}%
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-0.5">
                      <Minus className="h-3.5 w-3.5" /> 0%
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`text-[11px] font-medium ${isAbove ? "text-rose-600" : "text-emerald-700"}`}>
                    {pt.trend_status || (isAbove ? "Vượt ngưỡng khuyến cáo" : "Trong giới hạn an toàn")}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

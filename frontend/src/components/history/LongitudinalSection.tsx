"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, LineChart as ChartIcon, CheckCircle2 } from "lucide-react";
import { RiskTrajectoryResponse } from "@/types/screening";
import { screeningApi } from "@/lib/api/screening";
import { TrajectoryDeltaTable } from "./TrajectoryDeltaTable";

const DynamicChart = dynamic(
  () => import("./LongitudinalTrajectoryChart").then((m) => m.LongitudinalTrajectoryChart),
  { ssr: false, loading: () => <Skeleton className="h-[280px] w-full rounded-xl" /> }
);

const DISEASES = [
  { key: "diabetes_binary", label: "Tiểu đường (Lối sống)" },
  { key: "hypertension", label: "Tăng huyết áp" },
  { key: "cardiovascular", label: "Tim mạch" },
  { key: "stroke", label: "Đột quỵ" },
  { key: "diabetes_clinical", label: "Tiểu đường (Lâm sàng)" },
];

export function LongitudinalSection() {
  const [disease, setDisease] = useState("diabetes_binary");
  const [data, setData] = useState<RiskTrajectoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    screeningApi.getTrajectory(disease)
      .then((res) => { if (active) setData(res); })
      .catch(() => { if (active) setData(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [disease]);

  const points = data?.trajectory || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs value={disease} onValueChange={setDisease} className="w-full sm:w-auto">
          <TabsList className="h-10 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex-wrap">
            {DISEASES.map((d) => (
              <TabsTrigger key={d.key} value={d.key} className="h-8 px-3 text-xs rounded-lg">
                {d.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <Skeleton className="h-[360px] w-full rounded-2xl" />
      ) : points.length >= 2 ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-900/50 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-teal-900 dark:text-teal-200">Đánh giá Diễn tiến Tổng thể:</span>
              <p className="text-teal-800 dark:text-teal-300">{data?.overall_trend}</p>
            </div>
          </div>
          <DynamicChart trajectory={points} optimalThreshold={data?.optimal_threshold || 0.15} />
          <TrajectoryDeltaTable points={points} threshold={data?.optimal_threshold || 0.15} />
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
          <ChartIcon className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa đủ mốc khảo sát chuỗi thời gian ({points.length}/2 lần)
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống cần tối thiểu 2 lần sàng lọc để phân tích biến thiên nguy cơ (Delta Risk) và vẽ biểu đồ xu hướng.
          </p>
        </div>
      )}
    </div>
  );
}

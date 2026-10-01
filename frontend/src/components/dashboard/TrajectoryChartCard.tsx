"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskTrajectoryResponse } from "@/types/screening";
import { screeningApi } from "@/lib/api/screening";

const DynamicLineChart = dynamic(
  () => import("./TrajectoryLineChart").then((mod) => mod.TrajectoryLineChart),
  { ssr: false, loading: () => <Skeleton className="h-[260px] w-full rounded-xl" /> }
);

const DISEASES = [
  { key: "diabetes_binary", label: "Tiểu đường" },
  { key: "hypertension", label: "Huyết áp" },
  { key: "cardiovascular", label: "Tim mạch" },
  { key: "stroke", label: "Đột quỵ" },
];

export function TrajectoryChartCard() {
  const [activeDisease, setActiveDisease] = useState("diabetes_binary");
  const [data, setData] = useState<RiskTrajectoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    screeningApi.getTrajectory(activeDisease)
      .then((res) => { if (isMounted) setData(res); })
      .catch(() => { if (isMounted) setData(null); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [activeDisease]);

  const trajectory = data?.trajectory || [];
  const trend = data?.overall_trend || "INSUFFICIENT_DATA";

  const renderTrendBadge = () => {
    if (trend === "IMPROVING" || trend.includes("Tích cực")) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><TrendingDown className="h-3 w-3" /> Tích cực (Nguy cơ giảm)</Badge>;
    }
    if (trend === "WORSENING" || trend.includes("chú ý")) {
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 gap-1"><TrendingUp className="h-3 w-3" /> Cần chú ý (Nguy cơ tăng)</Badge>;
    }
    return <Badge variant="outline" className="text-slate-600 gap-1"><Minus className="h-3 w-3" /> Ổn định / Chưa đủ mốc</Badge>;
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Diễn tiến Nguy cơ Chuỗi thời gian</h2>
          <p className="text-[11px] text-slate-500">Biến thiên điểm xác suất rủi ro qua các lần khảo sát</p>
        </div>
        <div className="flex items-center gap-2">
          {renderTrendBadge()}
          <Tabs value={activeDisease} onValueChange={setActiveDisease}>
            <TabsList className="h-9 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {DISEASES.map((d) => (
                <TabsTrigger key={d.key} value={d.key} className="h-8 px-2.5 text-xs rounded-md">
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-[260px] w-full rounded-xl" />
      ) : trajectory.length >= 2 ? (
        <DynamicLineChart trajectory={trajectory} optimalThreshold={data?.optimal_threshold || 0.15} />
      ) : (
        <div className="h-[220px] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-4 text-center">
          <Info className="h-8 w-8 text-teal-500 mb-2 opacity-80" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Chưa đủ dữ liệu chuỗi thời gian cho bệnh {DISEASES.find(d => d.key === activeDisease)?.label}
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mt-1">
            Hệ thống cần tối thiểu 2 lần sàng lọc để vẽ biểu đồ và phân tích độ biến thiên (Delta Risk).
          </p>
        </div>
      )}
    </div>
  );
}

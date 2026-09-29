"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import { RiskFactor } from "@/types/screening";

interface ShapBarChartProps {
  factors: RiskFactor[];
}

export function ShapBarChart({ factors }: ShapBarChartProps) {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        Không có dữ liệu đóng góp SHAP cho lần sàng lọc này.
      </div>
    );
  }

  // Chuẩn bị dữ liệu hiển thị trên biểu đồ
  const chartData = factors.map((item) => {
    const shapVal = typeof item.shap_value === "number" ? item.shap_value : 0;
    const isRisk = item.impact.includes("+") || shapVal > 0;
    return {
      name: item.feature_name_vi || item.feature,
      shap: Math.abs(shapVal),
      rawShap: shapVal,
      impact: item.impact,
      value: item.value,
      isRisk,
    };
  });

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-medical-100 dark:bg-medical-950 text-medical-600 dark:text-medical-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Giải thích Minh bạch Y tế (TreeSHAP XAI)
            </h4>
            <p className="text-[11px] text-slate-400">
              Mức độ đóng góp định lượng của từng yếu tố làm tăng hoặc giảm rủi ro
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11 }}
              width={140}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-lg space-y-1">
                      <p className="font-bold">{data.name}</p>
                      <p className="text-slate-300">
                        Chỉ số người bệnh: <span className="font-semibold text-white">{data.value}</span>
                      </p>
                      <p className={data.isRisk ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                        Tác động: {data.impact}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="shap" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isRisk ? "#f43f5e" : "#10b981"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Làm tăng rủi ro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Yếu tố bảo vệ / Giảm rủi ro</span>
        </div>
      </div>
    </div>
  );
}

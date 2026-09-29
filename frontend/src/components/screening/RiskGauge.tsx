"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { RiskBadge } from "@/components/common/RiskBadge";
import { RiskLevel } from "@/types/screening";

interface RiskGaugeProps {
  score: number; // 0.0 - 1.0
  percentage: number; // 0 - 100
  level: RiskLevel;
  threshold: number; // Ngưỡng tối ưu Youden's J (0.0 - 1.0)
  diseaseName: string;
}

export function RiskGauge({
  percentage,
  level,
  threshold,
  diseaseName,
}: RiskGaugeProps) {
  // Tính toán góc quay của kim đo (-90 độ đến 90 độ cho nửa hình tròn 180 độ)
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const rotationDeg = -90 + (clampedPct / 100) * 180;
  const thresholdPct = Math.round(threshold * 100);

  const levelConfigs = {
    LOW: {
      color: "text-emerald-600 dark:text-emerald-400",
      bgBar: "bg-emerald-500",
      icon: CheckCircle,
      desc: "Nguy cơ nằm trong ngưỡng sinh lý an toàn.",
    },
    MEDIUM: {
      color: "text-amber-600 dark:text-amber-400",
      bgBar: "bg-amber-500",
      icon: AlertTriangle,
      desc: "Có dấu hiệu nguy cơ cần điều chỉnh lối sống.",
    },
    HIGH: {
      color: "text-rose-600 dark:text-rose-400",
      bgBar: "bg-rose-500",
      icon: ShieldAlert,
      desc: "Chỉ số vượt ngưỡng cảnh báo, cần thăm khám chuyên khoa.",
    },
  };

  const config = levelConfigs[level] || levelConfigs.LOW;
  const StatusIcon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between w-full mb-4">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Chỉ số rủi ro lâm sàng
        </span>
        <RiskBadge level={level} size="md" />
      </div>

      {/* Vòng cung đo lường SVG (Radial Arc Gauge) */}
      <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden mb-2">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Vòng cung nền xám */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            className="text-slate-200 dark:text-slate-800 stroke-round"
          />

          {/* Đoạn xanh (Low): 0% - 30% */}
          <path
            d="M 20 100 A 80 80 0 0 1 68 36"
            fill="none"
            stroke="#10b981"
            strokeWidth="16"
            className="stroke-round opacity-80"
          />
          {/* Đoạn vàng (Medium): 30% - 65% */}
          <path
            d="M 68 36 A 80 80 0 0 1 146 48"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="16"
            className="stroke-round opacity-80"
          />
          {/* Đoạn đỏ (High): 65% - 100% */}
          <path
            d="M 146 48 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            className="stroke-round opacity-80"
          />

          {/* Vị trí kim đo rủi ro */}
          <g transform={`rotate(${rotationDeg}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="28"
              stroke="#0f172a"
              strokeWidth="3.5"
              className="dark:stroke-white transition-transform duration-700 ease-out"
            />
            <circle cx="100" cy="100" r="7" fill="#0284c7" />
          </g>
        </svg>

        {/* Điểm giá trị số ở chân vòng cung */}
        <div className="absolute bottom-0 text-center">
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Thông tin ngưỡng cắt Youden's J & Ý nghĩa lâm sàng */}
      <div className="w-full mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
          <span>{config.desc}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Ngưỡng tối ưu Youden&apos;s J của mô hình: <strong>{thresholdPct}%</strong>
        </p>
      </div>
    </div>
  );
}

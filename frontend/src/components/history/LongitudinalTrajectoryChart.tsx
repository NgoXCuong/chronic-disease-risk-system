"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { RiskTrajectoryPoint } from "@/types/screening";

interface Props {
  trajectory: RiskTrajectoryPoint[];
  optimalThreshold: number;
}

export function LongitudinalTrajectoryChart({ trajectory, optimalThreshold }: Props) {
  const thresholdPct = optimalThreshold <= 1 ? Math.round(optimalThreshold * 1000) / 10 : optimalThreshold;

  const chartData = trajectory.map((item, idx) => ({
    index: idx + 1,
    date: new Date(item.recorded_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    fullDate: new Date(item.recorded_at).toLocaleString("vi-VN"),
    riskPercentage: item.risk_percentage,
    riskLevel: item.risk_level,
    delta: item.delta_risk ? Math.round(item.delta_risk * 1000) / 10 : null,
  }));

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 20, left: -16, bottom: 4 }}>
          <defs>
            <linearGradient id="riskTealGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl bg-slate-900 text-white text-xs shadow-xl space-y-1.5 border border-slate-700">
                    <p className="font-semibold text-slate-300">{p.fullDate}</p>
                    <p className="text-teal-400 font-extrabold text-sm">
                      Mức nguy cơ: {p.riskPercentage}% ({p.riskLevel})
                    </p>
                    <p className="text-[11px] text-rose-300">
                      Ngưỡng khuyến cáo: {thresholdPct}%
                    </p>
                    {p.delta !== null && (
                      <p className={`text-[11px] font-semibold ${p.delta > 0 ? "text-amber-300" : "text-emerald-300"}`}>
                        Biến thiên: {p.delta > 0 ? `+${p.delta}%` : `${p.delta}%`} so với đợt trước
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={thresholdPct}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            label={{ value: `Ngưỡng lâm sàng: ${thresholdPct}%`, fill: "#f43f5e", fontSize: 10, position: "insideTopRight" }}
          />
          <Area
            type="monotone"
            dataKey="riskPercentage"
            stroke="#0d9488"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#riskTealGradient)"
            dot={{ r: 5, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "#0f766e" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

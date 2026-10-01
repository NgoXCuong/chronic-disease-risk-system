"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

export function TrajectoryLineChart({ trajectory, optimalThreshold }: Props) {
  const thresholdPercent = optimalThreshold <= 1 ? Math.round(optimalThreshold * 1000) / 10 : optimalThreshold;

  const data = trajectory.map((item, idx) => ({
    index: idx + 1,
    date: new Date(item.recorded_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    fullDate: new Date(item.recorded_at).toLocaleString("vi-VN"),
    riskPercentage: item.risk_percentage,
    riskLevel: item.risk_level,
    threshold: thresholdPercent,
  }));

  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const p = payload[0].payload;
                return (
                  <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-lg space-y-1 border border-slate-700">
                    <p className="font-semibold text-slate-300">{p.fullDate}</p>
                    <p className="text-teal-400 font-extrabold text-sm">
                      Nguy cơ: {p.riskPercentage}% ({p.riskLevel})
                    </p>
                    <p className="text-[11px] text-rose-300">
                      Ngưỡng lâm sàng: {thresholdPercent}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={thresholdPercent}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            label={{ value: `Ngưỡng: ${thresholdPercent}%`, fill: "#f43f5e", fontSize: 10, position: "insideTopRight" }}
          />
          <Line
            type="monotone"
            dataKey="riskPercentage"
            stroke="#0d9488"
            strokeWidth={3}
            dot={{ r: 5, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 7, fill: "#0f766e" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

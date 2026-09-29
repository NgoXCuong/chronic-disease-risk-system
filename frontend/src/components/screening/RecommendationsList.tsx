"use client";

import * as React from "react";
import { CheckCircle2, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RiskLevel } from "@/types/screening";

interface RecommendationsListProps {
  recommendations: string[];
  riskLevel: RiskLevel;
}

export function RecommendationsList({
  recommendations,
  riskLevel,
}: RecommendationsListProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-medical-50 dark:bg-medical-950 text-medical-600 dark:text-medical-400 flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Khuyến nghị Chăm sóc &amp; Theo dõi Lâm sàng
            </h4>
            <p className="text-[11px] text-slate-400">
              Dựa trên phân tầng nguy cơ {riskLevel} và các yếu tố đóng góp SHAP
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-medical-600 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

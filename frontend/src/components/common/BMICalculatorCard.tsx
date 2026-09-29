"use client";

import * as React from "react";
import { Activity, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface BMICalculatorCardProps {
  heightCm?: number | null;
  weightKg?: number | null;
  className?: string;
}

export interface BMICategory {
  label: string;
  category: "underweight" | "normal" | "overweight" | "obese";
  colorClass: string;
  badgeClass: string;
  recommendation: string;
}

/**
 * Phân loại chỉ số khối cơ thể (BMI) theo tiêu chuẩn WHO khu vực Tây Thái Bình Dương (WPRO dành riêng cho người Châu Á):
 * - Dưới 18.5: Thiếu cân
 * - 18.5 - 22.9: Thể trạng bình thường (Lý tưởng)
 * - 23.0 - 24.9: Tiền béo phì (Thừa cân)
 * - Từ 25.0 trở lên: Béo phì (Nguy cơ tim mạch và tiểu đường tăng cao)
 */
export function getAsianBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) {
    return {
      label: "Thiếu cân",
      category: "underweight",
      colorClass: "text-sky-600 dark:text-sky-400",
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
      recommendation: "Cần tăng cường dinh dưỡng đa lượng hợp lý và rèn luyện thể lực nâng cao khối cơ.",
    };
  }
  if (bmi <= 22.9) {
    return {
      label: "Bình thường (Lý tưởng)",
      category: "normal",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
      recommendation: "Chỉ số thể trạng đạt chuẩn y học. Hãy tiếp tục duy trì chế độ vận động và ăn uống hiện tại.",
    };
  }
  if (bmi <= 24.9) {
    return {
      label: "Tiền béo phì (Thừa cân)",
      category: "overweight",
      colorClass: "text-amber-600 dark:text-amber-400",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
      recommendation: "Nguy cơ kháng insulin bắt đầu tăng. Nên kiểm soát lượng carbohydrate và duy trì cardio 150 phút/tuần.",
    };
  }
  return {
    label: "Béo phì",
    category: "obese",
    colorClass: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    recommendation: "Nguy cơ cao mắc đái tháo đường Týp 2 và bệnh tim mạch. Cần can thiệp chế độ giảm cân khoa học.",
  };
}

export function BMICalculatorCard({
  heightCm,
  weightKg,
  className,
}: BMICalculatorCardProps) {
  const bmi = React.useMemo(() => {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
    const heightM = heightCm / 100;
    const value = weightKg / (heightM * heightM);
    return Math.round(value * 10) / 10;
  }, [heightCm, weightKg]);

  if (!bmi) {
    return null;
  }

  const category = getAsianBMICategory(bmi);

  // Tính vị trí thanh trượt từ BMI 15 đến 35 (chuẩn phổ sinh học)
  const percentage = Math.min(Math.max(((bmi - 15) / (35 - 15)) * 100, 2), 98);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-medical-50 dark:bg-medical-950/80 flex items-center justify-center text-medical-600 dark:text-medical-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Chỉ số khối cơ thể (BMI)
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {bmi.toFixed(1)}{" "}
              <span className="text-xs font-normal text-slate-500">kg/m²</span>
            </span>
          </div>
        </div>
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-bold border",
            category.badgeClass
          )}
        >
          {category.label}
        </div>
      </div>

      {/* Visual BMI Gauge Spectrum */}
      <div className="space-y-1 mb-3">
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex">
          <div className="w-[17.5%] bg-sky-400" title="Thiếu cân (< 18.5)" />
          <div className="w-[22%] bg-emerald-500" title="Bình thường (18.5 - 22.9)" />
          <div className="w-[10%] bg-amber-400" title="Thừa cân (23.0 - 24.9)" />
          <div className="w-[50.5%] bg-rose-500" title="Béo phì (>= 25.0)" />
        </div>
        <div className="relative h-2">
          <div
            className="absolute top-0 -ml-1.5 w-3 h-3 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 shadow transition-all duration-300"
            style={{ left: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
          <span>&lt; 18.5</span>
          <span>22.9</span>
          <span>24.9</span>
          <span>&ge; 30</span>
        </div>
      </div>

      {/* Clinical Recommendation Text */}
      <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
        <Info className="w-4 h-4 text-medical-600 dark:text-medical-400 shrink-0 mt-0.5" />
        <span>{category.recommendation}</span>
      </div>
    </div>
  );
}

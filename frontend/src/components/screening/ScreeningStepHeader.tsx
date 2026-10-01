import React from "react";
import { UserCheck, HeartPulse, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  currentStep: number;
}

export function ScreeningStepHeader({ currentStep }: Props) {
  const steps = [
    { number: 1, title: "Chỉ số Thể chất", desc: "BMI & Nhân khẩu", icon: UserCheck },
    { number: 2, title: "Thói quen Lối sống", desc: "Vận động & Sinh hoạt", icon: Activity },
    { number: 3, title: "Tiền sử Bệnh lý", desc: "Y tế & Tiếp cận chăm sóc", icon: HeartPulse },
  ];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full space-y-4 mb-8">
      {/* 3 Nút bước */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map((s) => {
          const isDone = currentStep > s.number;
          const isCurrent = currentStep === s.number;

          return (
            <div
              key={s.number}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                isCurrent
                  ? "bg-teal-50/80 border-teal-500/50 dark:bg-teal-950/40 dark:border-teal-700 shadow-sm"
                  : isDone
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                  isCurrent
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 hidden sm:block">
                <p
                  className={`text-xs font-bold truncate leading-tight ${
                    isCurrent ? "text-teal-900 dark:text-teal-200" : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thanh tiến độ */}
      <Progress value={progressPercentage} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

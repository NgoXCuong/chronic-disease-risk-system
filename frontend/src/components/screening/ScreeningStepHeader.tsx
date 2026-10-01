import React from "react";
import { UserCheck, HeartPulse, Activity, Clock, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Props {
  currentStep: number;
}

export function ScreeningStepHeader({ currentStep }: Props) {
  const steps = [
    { number: 1, title: "Chỉ số Thể chất", desc: "BMI, Tuổi & Nhân trắc", icon: UserCheck },
    { number: 2, title: "Thói quen Lối sống", desc: "Vận động & Sinh hoạt", icon: Activity },
    { number: 3, title: "Tiền sử Bệnh lý", desc: "Tim mạch & Y tế cơ sở", icon: HeartPulse },
  ];

  // Tiến độ phần trăm chuẩn: Bước 1: 33%, Bước 2: 66%, Bước 3: 100%
  const progressPercentage = Math.round((currentStep / steps.length) * 100);

  return (
    <div className="w-full space-y-4 mb-8">
      {/* Thanh thông tin trạng thái trên cùng */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <Badge variant="outline" className="rounded-lg text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40">
            Bước {currentStep} / {steps.length}
          </Badge>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Ước tính: ~2 phút khảo sát</span>
        </div>
      </div>

      {/* 3 Thẻ Bước tương tác */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {steps.map((s) => {
          const isDone = currentStep > s.number;
          const isCurrent = currentStep === s.number;

          return (
            <div
              key={s.number}
              className={`relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                isCurrent
                  ? "bg-white dark:bg-slate-900 border-teal-500 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/20"
                  : isDone
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/70 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300"
                  : "bg-slate-50/80 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 opacity-60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30 ring-2 ring-teal-200 dark:ring-teal-900"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
              </div>
              <div className="min-w-0 hidden sm:block">
                <p
                  className={`text-xs font-bold truncate leading-tight ${
                    isCurrent
                      ? "text-teal-900 dark:text-teal-200"
                      : isDone
                      ? "text-emerald-900 dark:text-emerald-300"
                      : "text-slate-700 dark:text-slate-400"
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

      {/* Thanh tiến độ chuyển động mượt mà */}
      <div className="relative pt-1">
        <Progress value={progressPercentage} className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>
    </div>
  );
}

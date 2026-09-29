import * as React from "react";
import { Check, ClipboardList, HeartPulse, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreeningStepperProps {
  currentStep: number;
  totalSteps?: number;
}

export function ScreeningStepper({ currentStep, totalSteps = 3 }: ScreeningStepperProps) {
  const steps = [
    {
      step: 1,
      title: "Thể chất & Lối sống",
      subtitle: "Nhân khẩu học, BMI & Thói quen",
      icon: ClipboardList,
    },
    {
      step: 2,
      title: "Bệnh lý & Thể trạng",
      subtitle: "Tiền sử bệnh mạn tính & Sức khỏe",
      icon: HeartPulse,
    },
    {
      step: 3,
      title: "Chỉ số Xét nghiệm",
      subtitle: "Lâm sàng Pima & Hoàn tất",
      icon: Microscope,
    },
  ];

  return (
    <div className="w-full py-4 mb-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
        {steps.map((item) => {
          const isCompleted = currentStep > item.step;
          const isActive = currentStep === item.step;
          const Icon = item.icon;

          return (
            <div
              key={item.step}
              className={cn(
                "flex flex-col items-center text-center p-3 rounded-xl border transition-all",
                isActive
                  ? "bg-medical-50/80 border-medical-500 shadow-xs dark:bg-medical-950/40 dark:border-medical-500"
                  : isCompleted
                  ? "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300"
                  : "bg-white border-slate-200/60 text-slate-400 dark:bg-slate-950 dark:border-slate-800/60"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors",
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isActive
                    ? "bg-medical-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              <span
                className={cn(
                  "text-xs sm:text-sm font-bold truncate max-w-full",
                  isActive
                    ? "text-medical-800 dark:text-medical-300"
                    : isCompleted
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {item.title}
              </span>

              <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {item.subtitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Check, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthBarProps {
  password?: string;
  className?: string;
}

export function PasswordStrengthBar({
  password = "",
  className,
}: PasswordStrengthBarProps) {
  // Đánh giá 4 tiêu chí an toàn y tế cho mật khẩu
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const criteria = [
    { label: "8+ ký tự", met: hasMinLength },
    { label: "Chữ hoa (A-Z)", met: hasUppercase },
    { label: "Chữ thường (a-z)", met: hasLowercase },
    { label: "Chữ số (0-9)", met: hasNumber },
  ];

  const score = criteria.filter((c) => c.met).length;

  // Cấu hình nhãn và màu sắc tương ứng với 4 nấc bảo mật
  const strengthConfigs = [
    {
      label: "Độ an toàn mật khẩu",
      color: "text-slate-400 dark:text-slate-500",
      barColor: "bg-slate-200 dark:bg-slate-800",
    },
    {
      label: "Mức độ: Rất yếu",
      color: "text-rose-500",
      barColor: "bg-rose-500",
    },
    {
      label: "Mức độ: Trung bình",
      color: "text-amber-500",
      barColor: "bg-amber-500",
    },
    {
      label: "Mức độ: Khá an toàn",
      color: "text-teal-600 dark:text-teal-400",
      barColor: "bg-teal-500",
    },
    {
      label: "Rất an toàn (Đạt chuẩn bảo mật y tế)",
      color: "text-emerald-600 dark:text-emerald-400",
      barColor: "bg-emerald-500",
    },
  ];

  const currentConfig = strengthConfigs[score];

  return (
    <div className={cn("space-y-1.5 pt-1", className)}>
      {/* Tiêu đề & Nhãn đánh giá độ mạnh */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-slate-400">Độ mạnh mật khẩu</span>
        <span className={cn("font-bold transition-colors", currentConfig.color)}>
          {currentConfig.label}
        </span>
      </div>

      {/* Thanh tiến độ phân đoạn 4 nấc (Segmented Progress Bar) */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = score >= step;
          return (
            <div
              key={step}
              className={cn(
                "h-full rounded-full transition-all duration-300",
                isFilled ? currentConfig.barColor : "bg-slate-200 dark:bg-slate-800"
              )}
            />
          );
        })}
      </div>

      {/* Gợi ý yêu cầu mật khẩu y tế */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
        {score === 4 ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3 h-3" /> Mật khẩu đạt tiêu chuẩn an toàn bảo vệ hồ sơ bệnh án
          </span>
        ) : (
          <span>Cần 8+ ký tự, gồm cả chữ hoa, chữ thường và chữ số</span>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export function PasswordStrengthIndicator({ password = "" }: PasswordStrengthIndicatorProps) {
  const criteria = [
    { label: "Tối thiểu 8 ký tự", met: password.length >= 8 },
    { label: "Có chữ in hoa (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Có chữ in thường (a-z)", met: /[a-z]/.test(password) },
    { label: "Có chữ số (0-9)", met: /\d/.test(password) },
  ];

  const score = criteria.filter((c) => c.met).length;

  const getBarColor = (index: number) => {
    if (index >= score) return "bg-slate-200 dark:bg-slate-800";
    if (score <= 2) return "bg-rose-500";
    if (score === 3) return "bg-amber-500";
    return "bg-teal-600";
  };

  return (
    <div className="space-y-2 mt-2">
      {/* 4 thanh chỉ báo độ mạnh */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`rounded-full transition-all duration-300 ${getBarColor(idx)}`}
          />
        ))}
      </div>

      {/* Danh sách 4 tiêu chí chuẩn y tế */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {item.met ? (
              <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <span
              className={`text-[11px] transition-colors ${
                item.met
                  ? "text-teal-700 dark:text-teal-300 font-medium"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

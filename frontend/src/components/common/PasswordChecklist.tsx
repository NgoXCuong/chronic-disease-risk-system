import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordChecklistProps {
  password?: string;
  className?: string;
}

export function PasswordChecklist({ password = "", className }: PasswordChecklistProps) {
  const criteria = [
    { label: "Tối thiểu 8 ký tự", met: password.length >= 8 },
    { label: "Ít nhất 1 chữ hoa (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Ít nhất 1 chữ thường (a-z)", met: /[a-z]/.test(password) },
    { label: "Ít nhất 1 chữ số (0-9)", met: /\d/.test(password) },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1.5 p-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]",
        className
      )}
    >
      {criteria.map((c, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 ${
            c.met
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <Check
            className={`w-3.5 h-3.5 ${
              c.met ? "text-emerald-600 dark:text-emerald-400" : "text-slate-300 dark:text-slate-600"
            }`}
          />
          <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

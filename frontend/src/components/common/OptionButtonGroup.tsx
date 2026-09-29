"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface OptionItem<T = number | string> {
  value: T;
  label: string;
  desc?: string;
  icon?: LucideIcon;
}

interface OptionButtonGroupProps<T = number | string> {
  label: string;
  description?: string;
  value: T;
  onChange: (val: T) => void;
  options?: OptionItem<T>[];
  required?: boolean;
  error?: string;
  className?: string;
}

export function OptionButtonGroup<T = number | string>({
  label,
  description,
  value,
  onChange,
  options = [
    { value: 1 as T, label: "Có" },
    { value: 0 as T, label: "Không" },
  ],
  required,
  error,
  className,
}: OptionButtonGroupProps<T>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex flex-col">
        <Label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </Label>
        {description && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            {description}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const Icon = opt.icon;

          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-2 select-none",
                isSelected
                  ? "bg-medical-600 text-white border-medical-600 shadow-sm dark:bg-medical-500 dark:border-medical-500"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-850"
              )}
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

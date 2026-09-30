"use client";

import * as React from "react";
import { Minus, Plus, LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NumberStepperInputProps {
  id: string;
  label: string;
  unit: string;
  value?: number | string;
  onChange: (val: any) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  defaultValue?: number;
  icon?: LucideIcon;
  error?: string;
  required?: boolean;
  className?: string;
}

export function NumberStepperInput({
  id,
  label,
  unit,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 0.5,
  placeholder = "0",
  defaultValue,
  icon: Icon,
  error,
  required,
  className,
}: NumberStepperInputProps) {
  // Kiểm tra xem người dùng đã có giá trị thực hay chưa
  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "" &&
    !isNaN(Number(value));

  const currentVal = hasValue ? Number(value) : null;

  // Xác định mốc khởi đầu thông minh khi ô còn trống
  const parsedPlaceholder = Number(placeholder);
  const fallbackBase =
    defaultValue ??
    (!isNaN(parsedPlaceholder) && parsedPlaceholder > 0
      ? parsedPlaceholder
      : min > 0
      ? min
      : 0);

  // Điều kiện vô hiệu hóa nút Giảm [-]
  // Khi chưa nhập, nếu fallbackBase > min (ví dụ chiều cao 168 > 50) thì KHÔNG vô hiệu hóa
  const isDecreaseDisabled = hasValue
    ? currentVal !== null && currentVal <= min
    : fallbackBase <= min;

  // Điều kiện vô hiệu hóa nút Tăng [+]
  const isIncreaseDisabled = hasValue
    ? currentVal !== null && currentVal >= max
    : fallbackBase >= max;

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDecreaseDisabled) return;

    if (hasValue && currentVal !== null) {
      const next = Math.max(Number((currentVal - step).toFixed(1)), min);
      onChange(next);
    } else {
      // Khi chưa có giá trị, giảm từ mốc gợi ý
      const next = Math.max(Number((fallbackBase - step).toFixed(1)), min);
      onChange(next);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isIncreaseDisabled) return;

    if (hasValue && currentVal !== null) {
      const next = Math.min(Number((currentVal + step).toFixed(1)), max);
      onChange(next);
    } else {
      // Khi chưa có giá trị, tăng từ mốc gợi ý
      const next = Math.min(Number((fallbackBase + step).toFixed(1)), max);
      onChange(next);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange("" as any);
      return;
    }
    const val = parseFloat(raw);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>

      <div className="relative flex items-center rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs focus-within:ring-2 focus-within:ring-medical-500/20 focus-within:border-medical-500 transition-colors">
        {/* Nút Giảm [-] Touch target >= 44px */}
        <button
          type="button"
          onClick={handleDecrease}
          disabled={isDecreaseDisabled}
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-medical-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none"
          aria-label={`Giảm ${label}`}
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Ô nhập số trực tiếp */}
        <div className="relative flex-1 flex items-center justify-center">
          {Icon && (
            <Icon className="absolute left-2.5 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          )}
          <input
            id={id}
            type="number"
            step={step}
            min={min}
            max={max}
            value={hasValue && currentVal !== null ? currentVal : ""}
            placeholder={placeholder}
            onChange={handleInputChange}
            className={cn(
              "w-full h-11 bg-transparent text-center font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              Icon ? "pl-7" : "px-2"
            )}
          />
          {/* Huy hiệu đơn vị (cm / kg / ngày) */}
          <span className="absolute right-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase pointer-events-none">
            {unit}
          </span>
        </div>

        {/* Nút Tăng [+] Touch target >= 44px */}
        <button
          type="button"
          onClick={handleIncrease}
          disabled={isIncreaseDisabled}
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-medical-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none"
          aria-label={`Tăng ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

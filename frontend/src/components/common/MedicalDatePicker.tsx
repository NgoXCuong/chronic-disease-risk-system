"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MedicalDatePickerProps {
  id?: string;
  label: string;
  value?: string; // Định dạng YYYY-MM-DD
  onChange: (dateStr: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function MedicalDatePicker({
  id = "date_of_birth",
  label,
  value = "",
  onChange,
  error,
  required,
  className,
}: MedicalDatePickerProps) {
  const [year, setYear] = React.useState<string>(() => (value ? value.split("-")[0] || "" : ""));
  const [month, setMonth] = React.useState<string>(() => (value ? value.split("-")[1] || "" : ""));
  const [day, setDay] = React.useState<string>(() => (value ? value.split("-")[2] || "" : ""));

  React.useEffect(() => {
    if (value && value.includes("-")) {
      const parts = value.split("-");
      setYear(parts[0] || "");
      setMonth(parts[1] || "");
      setDay(parts[2] || "");
    }
  }, [value]);

  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    setDay(newDay);
    setMonth(newMonth);
    setYear(newYear);

    if (newDay && newMonth && newYear) {
      onChange(`${newYear}-${newMonth.padStart(2, "0")}-${newDay.padStart(2, "0")}`);
    } else {
      onChange("");
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 105 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-medical-600" />
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>

      <div className="grid grid-cols-3 gap-2">
        {/* Chọn Ngày (01 - 31) - Chuẩn Shadcn UI */}
        <Select value={day} onValueChange={(val) => updateDate(val, month, year)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Ngày" />
          </SelectTrigger>
          <SelectContent className="max-h-56">
            {days.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Chọn Tháng (01 - 12) - Chuẩn Shadcn UI */}
        <Select value={month} onValueChange={(val) => updateDate(day, val, year)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Tháng" />
          </SelectTrigger>
          <SelectContent className="max-h-56">
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                Tháng {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Chọn Năm (1920 - Hiện tại) - Chuẩn Shadcn UI */}
        <Select value={year} onValueChange={(val) => updateDate(day, month, val)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Năm" />
          </SelectTrigger>
          <SelectContent className="max-h-56">
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

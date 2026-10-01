import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { User, Ruler, Weight, Info, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegisterFormData } from "@/lib/validations/auth";
import { BiologicalSex } from "@/types/auth";

interface Props {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  setValue: UseFormSetValue<RegisterFormData>;
  watch?: UseFormWatch<RegisterFormData>;
}

export function RegisterVitalsSection({ register, errors, setValue, watch }: Props) {
  const heightVal = watch ? watch("height_cm") : undefined;
  const weightVal = watch ? watch("weight_kg") : undefined;

  const adjustValue = (
    field: "height_cm" | "weight_kg",
    delta: number,
    min: number,
    max: number,
    defaultVal: number
  ) => {
    const raw = field === "height_cm" ? heightVal : weightVal;
    const current = typeof raw === "number" && !isNaN(raw) ? raw : null;

    let next: number;
    if (current === null || current < min) {
      // Nếu chưa nhập hoặc đang ở mức 0/nhỏ hơn ngưỡng sinh học tối thiểu
      next = delta > 0 ? defaultVal : min;
    } else {
      next = Math.round((current + delta) * 10) / 10;
      next = Math.max(min, Math.min(max, next));
    }

    setValue(field, next, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      {/* Họ và tên */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-fullname" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Họ và tên bệnh nhân
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="reg-fullname"
            type="text"
            placeholder="Nguyễn Văn A"
            className="pl-10 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800"
            {...register("full_name")}
          />
        </div>
        {errors.full_name && (
          <p className="text-xs text-rose-500 font-medium">{errors.full_name.message}</p>
        )}
      </div>

      {/* Giới tính sinh học */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Giới tính sinh học
        </Label>
        <Select onValueChange={(val) => setValue("gender", val as BiologicalSex)}>
          <SelectTrigger className="h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800">
            <SelectValue placeholder="Chọn giới tính sinh học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Nam (Male)</SelectItem>
            <SelectItem value="FEMALE">Nữ (Female)</SelectItem>
            <SelectItem value="OTHER">Khác (Other)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chiều cao & Cân nặng (Kèm Stepper +/- bằng Shadcn Button chuẩn Rule 3) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="reg-height" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Chiều cao (cm)
          </Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="reg-height"
              type="number"
              step="0.5"
              placeholder="170"
              className="pl-9 pr-16 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800"
              {...register("height_cm", { valueAsNumber: true })}
            />
            {/* Stepper Buttons */}
            <div className="flex items-center gap-0.5 absolute right-1 top-1/2 -translate-y-1/2 z-20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  adjustValue("height_cm", -1, 40, 250, 170);
                }}
                className="h-8 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg cursor-pointer transition-colors"
                aria-label="Giảm chiều cao"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  adjustValue("height_cm", 1, 40, 250, 170);
                }}
                className="h-8 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg cursor-pointer transition-colors"
                aria-label="Tăng chiều cao"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {errors.height_cm && (
            <p className="text-xs text-rose-500 font-medium">{errors.height_cm.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-weight" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Cân nặng (kg)
          </Label>
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="reg-weight"
              type="number"
              step="0.5"
              placeholder="65"
              className="pl-9 pr-16 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800"
              {...register("weight_kg", { valueAsNumber: true })}
            />
            {/* Stepper Buttons */}
            <div className="flex items-center gap-0.5 absolute right-1 top-1/2 -translate-y-1/2 z-20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  adjustValue("weight_kg", -1, 15, 300, 65);
                }}
                className="h-8 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg cursor-pointer transition-colors"
                aria-label="Giảm cân nặng"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  adjustValue("weight_kg", 1, 15, 300, 65);
                }}
                className="h-8 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg cursor-pointer transition-colors"
                aria-label="Tăng cân nặng"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {errors.weight_kg && (
            <p className="text-xs text-rose-500 font-medium">{errors.weight_kg.message}</p>
          )}
        </div>
      </div>

      {/* Ghi chú y tế hỗ trợ người dùng */}
      <div className="rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 p-3 text-xs text-teal-800 dark:text-teal-300 leading-relaxed flex items-start gap-2.5">
        <Info className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Chỉ số thể chất giúp tự động tính <strong>BMI</strong> phục vụ sàng lọc nguy cơ Đái tháo đường & Tim mạch. Bạn có thể bổ sung sau khi bắt đầu khảo sát.
        </p>
      </div>
    </div>
  );
}

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Ruler, Weight, Plus, Minus, Activity, GraduationCap, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScreeningFormValues } from "@/lib/validations/screening";
import { CDC_AGE_OPTIONS, EDUCATION_OPTIONS, INCOME_OPTIONS } from "@/lib/screening-constants";

interface Props {
  register: UseFormRegister<ScreeningFormValues>;
  errors: FieldErrors<ScreeningFormValues>;
  setValue: UseFormSetValue<ScreeningFormValues>;
  watch: UseFormWatch<ScreeningFormValues>;
}

export function Step1Demographics({ register, errors, setValue, watch }: Props) {
  const heightVal = watch("height_cm") || 165;
  const weightVal = watch("weight_kg") || 60;
  const sexVal = watch("Sex");
  const ageVal = watch("Age");
  const eduVal = watch("Education");
  const incomeVal = watch("Income");

  // Tính BMI tự động theo thời gian thực
  const heightM = heightVal / 100;
  const bmi = heightM > 0 ? Number((weightVal / (heightM * heightM)).toFixed(1)) : 22.0;

  // Đánh giá thể trạng theo tiêu chuẩn châu Á (IDI & WPRO)
  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: "Thiếu cân", variant: "outline" as const, color: "text-amber-600 bg-amber-50" };
    if (val < 23.0) return { label: "Thể trạng Lý tưởng", variant: "default" as const, color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" };
    if (val < 25.0) return { label: "Thừa cân (Tiền béo phì)", variant: "secondary" as const, color: "text-amber-800 bg-amber-50 dark:bg-amber-950/40" };
    return { label: "Béo phì (Nguy cơ cao)", variant: "destructive" as const, color: "text-rose-700 bg-rose-50 dark:bg-rose-950/40" };
  };

  const bmiCat = getBmiCategory(bmi);

  const adjustValue = (
    field: "height_cm" | "weight_kg",
    delta: number,
    min: number,
    max: number,
    defaultVal: number
  ) => {
    const raw = field === "height_cm" ? heightVal : weightVal;
    const current = typeof raw === "number" && !isNaN(raw) ? raw : defaultVal;
    let next = Math.round((current + delta) * 10) / 10;
    next = Math.max(min, Math.min(max, next));
    setValue(field, next, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      {/* Khối 1: Giới tính & Nhóm tuổi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Giới tính sinh học */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Giới tính sinh học <span className="text-rose-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={sexVal === 1 ? "default" : "outline"}
              onClick={() => setValue("Sex", 1, { shouldValidate: true })}
              className={`h-11 min-h-[44px] rounded-xl font-semibold text-xs ${
                sexVal === 1 ? "bg-teal-600 hover:bg-teal-700 text-white" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              Nam (Male)
            </Button>
            <Button
              type="button"
              variant={sexVal === 0 ? "default" : "outline"}
              onClick={() => setValue("Sex", 0, { shouldValidate: true })}
              className={`h-11 min-h-[44px] rounded-xl font-semibold text-xs ${
                sexVal === 0 ? "bg-teal-600 hover:bg-teal-700 text-white" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              Nữ (Female)
            </Button>
          </div>
        </div>

        {/* Nhóm độ tuổi */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Độ tuổi hiện tại <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={ageVal ? String(ageVal) : "4"}
            onValueChange={(val) => setValue("Age", Number(val), { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Chọn nhóm tuổi" />
            </SelectTrigger>
            <SelectContent>
              {CDC_AGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Khối 2: Chiều cao & Cân nặng (Tích hợp Stepper Shadcn) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chiều cao */}
        <div className="space-y-1.5">
          <Label htmlFor="height_cm" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Chiều cao đứng (cm) <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="height_cm"
              type="number"
              step="0.5"
              className="pl-9 pr-16 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800"
              {...register("height_cm", { valueAsNumber: true })}
            />
            <div className="flex items-center gap-0.5 absolute right-1.5 top-1/2 -translate-y-1/2 z-20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => adjustValue("height_cm", -1, 50, 250, 165)}
                className="h-8 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => adjustValue("height_cm", 1, 50, 250, 165)}
                className="h-8 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {errors.height_cm && (
            <p className="text-xs text-rose-500 font-medium">{errors.height_cm.message}</p>
          )}
        </div>

        {/* Cân nặng */}
        <div className="space-y-1.5">
          <Label htmlFor="weight_kg" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Cân nặng hiện tại (kg) <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="weight_kg"
              type="number"
              step="0.5"
              className="pl-9 pr-16 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800"
              {...register("weight_kg", { valueAsNumber: true })}
            />
            <div className="flex items-center gap-0.5 absolute right-1.5 top-1/2 -translate-y-1/2 z-20">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => adjustValue("weight_kg", -1, 20, 300, 60)}
                className="h-8 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => adjustValue("weight_kg", 1, 20, 300, 60)}
                className="h-8 w-7 text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg"
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

      {/* Khối Thẻ Chỉ số BMI Tự động tính */}
      <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-teal-800 dark:text-teal-300 block">
              Chỉ số khối cơ thể (BMI)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {bmi}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">kg/m²</span>
            </div>
          </div>
        </div>
        <div>
          <Badge className={`px-3 py-1 rounded-xl text-xs font-bold border-0 ${bmiCat.color}`}>
            {bmiCat.label}
          </Badge>
        </div>
      </div>

      {/* Khối 3: Học vấn & Thu nhập */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-slate-400" />
            Trình độ học vấn
          </Label>
          <Select
            value={String(eduVal || 4)}
            onValueChange={(val) => setValue("Education", Number(val))}
          >
            <SelectTrigger className="h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Chọn học vấn" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-slate-400" />
            Khung thu nhập hộ gia đình
          </Label>
          <Select
            value={String(incomeVal || 5)}
            onValueChange={(val) => setValue("Income", Number(val))}
          >
            <SelectTrigger className="h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Chọn mức thu nhập" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

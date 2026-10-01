import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Ruler, Weight, Plus, Minus, User, UserCheck, GraduationCap, DollarSign, Calendar, Info } from "lucide-react";
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
    if (val < 18.5) {
      return {
        label: "Thiếu cân (< 18.5)",
        color: "text-blue-700 dark:text-blue-400",
        badgeBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
        desc: "Thể trạng gầy, cần bổ sung dinh dưỡng.",
        percent: Math.min(100, Math.max(0, ((val - 12) / (18.5 - 12)) * 25)),
      };
    }
    if (val < 23.0) {
      return {
        label: "Thể trạng Lý tưởng (18.5 - 22.9)",
        color: "text-emerald-700 dark:text-emerald-400",
        badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
        desc: "Cân đối, nguy cơ chuyển hóa thấp.",
        percent: 25 + Math.min(25, Math.max(0, ((val - 18.5) / (23.0 - 18.5)) * 25)),
      };
    }
    if (val < 25.0) {
      return {
        label: "Thừa cân (23.0 - 24.9)",
        color: "text-amber-700 dark:text-amber-400",
        badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
        desc: "Tiền béo phì, nên kiểm soát calo.",
        percent: 50 + Math.min(25, Math.max(0, ((val - 23.0) / (25.0 - 23.0)) * 25)),
      };
    }
    return {
      label: "Béo phì (≥ 25.0)",
      color: "text-rose-700 dark:text-rose-400",
      badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800",
      desc: "Nguy cơ cao mắc tim mạch & tiểu đường.",
      percent: Math.min(100, 75 + ((val - 25.0) / (35.0 - 25.0)) * 25),
    };
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
      {/* Khối 1: Giới tính sinh học & Nhóm tuổi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Giới tính sinh học - Thiết kế thẻ tương tác 2 lựa chọn */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Giới tính sinh học <span className="text-rose-500">*</span></span>
            <span className="text-[11px] text-slate-400 font-normal">Cố định từ khai sinh</span>
          </Label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setValue("Sex", 1, { shouldValidate: true })}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-h-[52px] ${
                sexVal === 1
                  ? "border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <span className="text-xs font-bold">Nam (Male)</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Giá trị nhãn: 1</span>
            </button>
            <button
              type="button"
              onClick={() => setValue("Sex", 0, { shouldValidate: true })}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-h-[52px] ${
                sexVal === 0
                  ? "border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <span className="text-xs font-bold">Nữ (Female)</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Giá trị nhãn: 0</span>
            </button>
          </div>
        </div>

        {/* Nhóm độ tuổi */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>Độ tuổi hiện tại <span className="text-rose-500">*</span></span>
            <span className="text-[11px] text-slate-400 font-normal">Thang phân tầng CDC</span>
          </Label>
          <Select
            value={ageVal ? String(ageVal) : "4"}
            onValueChange={(val) => setValue("Age", Number(val), { shouldValidate: true })}
          >
            <SelectTrigger className="h-[52px] min-h-[44px] rounded-2xl border-slate-200 dark:border-slate-800 px-3.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-600 shrink-0" />
                <SelectValue placeholder="Chọn nhóm tuổi" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {CDC_AGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)} className="text-xs py-2">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Khối 2: Chiều cao & Cân nặng (Chỉ số cơ thể) */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Chỉ số Nhân trắc học & Thể trạng
          </h4>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="h-3 w-3" /> Tự động tính chỉ số BMI
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Chiều cao */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5 text-teal-600" />
              Chiều cao (cm) <span className="text-rose-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("height_cm", -1, 50, 250, 165)}
                className="h-11 w-11 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                step="0.5"
                {...register("height_cm", { valueAsNumber: true })}
                className="h-11 rounded-xl text-center font-bold text-sm border-slate-200 dark:border-slate-800"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("height_cm", 1, 50, 250, 165)}
                className="h-11 w-11 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.height_cm && (
              <p className="text-[11px] text-rose-500">{errors.height_cm.message}</p>
            )}
          </div>

          {/* Cân nặng */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Weight className="h-3.5 w-3.5 text-teal-600" />
              Cân nặng (kg) <span className="text-rose-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("weight_kg", -0.5, 20, 300, 60)}
                className="h-11 w-11 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                step="0.5"
                {...register("weight_kg", { valueAsNumber: true })}
                className="h-11 rounded-xl text-center font-bold text-sm border-slate-200 dark:border-slate-800"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue("weight_kg", 0.5, 20, 300, 60)}
                className="h-11 w-11 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.weight_kg && (
              <p className="text-[11px] text-rose-500">{errors.weight_kg.message}</p>
            )}
          </div>
        </div>

        {/* Bảng đồng hồ trực quan BMI */}
        <div className={`p-4 rounded-xl border transition-all ${bmiCat.badgeBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chỉ số khối cơ thể (BMI):
                </span>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                  {bmi} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {bmiCat.desc}
              </p>
            </div>
            <Badge variant="outline" className={`font-bold text-xs py-1 px-3 rounded-lg border ${bmiCat.color}`}>
              {bmiCat.label}
            </Badge>
          </div>

          {/* Thanh phân dải màu sắc chuẩn IDI & WPRO châu Á */}
          <div className="mt-3 space-y-1">
            <div className="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
              <div className="h-full bg-blue-400 w-1/4" title="Thiếu cân (< 18.5)" />
              <div className="h-full bg-emerald-500 w-1/4" title="Lý tưởng (18.5 - 22.9)" />
              <div className="h-full bg-amber-400 w-1/4" title="Thừa cân (23.0 - 24.9)" />
              <div className="h-full bg-rose-500 w-1/4" title="Béo phì (≥ 25.0)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-medium">
              <span>&lt; 18.5</span>
              <span>18.5 - 22.9</span>
              <span>23.0 - 24.9</span>
              <span>≥ 25.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Khối 3: Trình độ học vấn & Thu nhập gia đình */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Trình độ học vấn */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-teal-600" />
            Trình độ học vấn cao nhất
          </Label>
          <Select
            value={eduVal ? String(eduVal) : "4"}
            onValueChange={(val) => setValue("Education", Number(val), { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Chọn trình độ học vấn" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mức thu nhập */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-teal-600" />
            Mức thu nhập gia đình
          </Label>
          <Select
            value={incomeVal ? String(incomeVal) : "5"}
            onValueChange={(val) => setValue("Income", Number(val), { shouldValidate: true })}
          >
            <SelectTrigger className="h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Chọn mức thu nhập" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
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

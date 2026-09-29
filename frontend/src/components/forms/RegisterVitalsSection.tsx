"use client";

import * as React from "react";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { Heart, Ruler, User, Weight } from "lucide-react";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { MedicalDatePicker } from "@/components/common/MedicalDatePicker";
import { NumberStepperInput } from "@/components/common/NumberStepperInput";
import { BMICalculatorCard } from "@/components/common/BMICalculatorCard";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegisterVitalsSectionProps {
  register: UseFormRegister<any>;
  control: any;
  errors: FieldErrors<any>;
  heightValue?: number | string;
  weightValue?: number | string;
}

export function RegisterVitalsSection({
  register,
  control,
  errors,
  heightValue,
  weightValue,
}: RegisterVitalsSectionProps) {
  const heightNum = heightValue ? Number(heightValue) : null;
  const weightNum = weightValue ? Number(weightValue) : null;

  return (
    <div className="space-y-3.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-medical-600" />
        2. Thông tin bệnh nhân &amp; Thể trạng ban đầu
      </h3>

      {/* Họ và tên bệnh nhân */}
      <MedicalInputField
        id="full_name"
        label="Họ và tên bệnh nhân"
        icon={User}
        placeholder="Ví dụ: Nguyễn Văn A"
        error={errors.full_name?.message as string}
        {...register("full_name")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Chọn ngày sinh chuẩn y tế dd/mm/yyyy */}
        <Controller
          name="date_of_birth"
          control={control}
          render={({ field }) => (
            <MedicalDatePicker
              id="date_of_birth"
              label="Ngày sinh"
              value={field.value}
              onChange={field.onChange}
              error={errors.date_of_birth?.message as string}
            />
          )}
        />

        {/* Chọn giới tính chuẩn Shadcn UI Select (Radix UI) */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Giới tính sinh học
              </Label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Chọn giới tính sinh học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam giới</SelectItem>
                  <SelectItem value="FEMALE">Nữ giới</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender?.message && (
                <p className="text-[11px] text-rose-500 font-medium">
                  {String(errors.gender.message)}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tăng giảm chiều cao có nút +/- chuẩn Stepper */}
        <Controller
          name="height_cm"
          control={control}
          render={({ field }) => (
            <NumberStepperInput
              id="height_cm"
              label="Chiều cao"
              unit="cm"
              min={50}
              max={250}
              step={0.5}
              icon={Ruler}
              placeholder="168"
              value={field.value}
              onChange={field.onChange}
              error={errors.height_cm?.message as string}
            />
          )}
        />

        {/* Tăng giảm cân nặng có nút +/- chuẩn Stepper */}
        <Controller
          name="weight_kg"
          control={control}
          render={({ field }) => (
            <NumberStepperInput
              id="weight_kg"
              label="Cân nặng"
              unit="kg"
              min={20}
              max={300}
              step={0.5}
              icon={Weight}
              placeholder="62"
              value={field.value}
              onChange={field.onChange}
              error={errors.weight_kg?.message as string}
            />
          )}
        />
      </div>

      {/* Thẻ tính BMI theo chuẩn WPRO y tế */}
      {heightNum && weightNum && heightNum > 0 && weightNum > 0 && (
        <BMICalculatorCard heightCm={heightNum} weightKg={weightNum} className="mt-2" />
      )}
    </div>
  );
}

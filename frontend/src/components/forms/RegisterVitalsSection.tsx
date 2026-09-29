"use client";

import * as React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Calendar, Heart, Ruler, User, Weight } from "lucide-react";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { BMICalculatorCard } from "@/components/common/BMICalculatorCard";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface RegisterVitalsSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  heightValue?: number | string;
  weightValue?: number | string;
}

export function RegisterVitalsSection({
  register,
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
        2. Thông tin cá nhân &amp; Thể trạng ban đầu
      </h3>

      <MedicalInputField
        id="full_name"
        label="Họ và tên bệnh nhân"
        icon={User}
        placeholder="Nguyễn Văn A"
        error={errors.full_name?.message as string}
        {...register("full_name")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MedicalInputField
          id="date_of_birth"
          type="date"
          label="Ngày sinh"
          icon={Calendar}
          error={errors.date_of_birth?.message as string}
          {...register("date_of_birth")}
        />

        <div className="space-y-1.5">
          <Label htmlFor="gender">Giới tính sinh học</Label>
          <Select id="gender" {...register("gender")}>
            <option value="">Chọn giới tính sinh học</option>
            <option value="MALE">Nam (Male)</option>
            <option value="FEMALE">Nữ (Female)</option>
            <option value="OTHER">Khác (Other)</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MedicalInputField
          id="height_cm"
          type="number"
          step="0.5"
          label="Chiều cao (cm)"
          icon={Ruler}
          placeholder="Ví dụ: 170"
          error={errors.height_cm?.message as string}
          {...register("height_cm")}
        />

        <MedicalInputField
          id="weight_kg"
          type="number"
          step="0.5"
          label="Cân nặng (kg)"
          icon={Weight}
          placeholder="Ví dụ: 65"
          error={errors.weight_kg?.message as string}
          {...register("weight_kg")}
        />
      </div>

      {heightNum && weightNum && heightNum > 0 && weightNum > 0 && (
        <BMICalculatorCard heightCm={heightNum} weightKg={weightNum} className="mt-2" />
      )}
    </div>
  );
}

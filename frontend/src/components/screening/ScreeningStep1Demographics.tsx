"use client";

import * as React from "react";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { Apple, Cigarette, Dumbbell, Ruler, Scale, Wine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BMICalculatorCard } from "@/components/common/BMICalculatorCard";
import { OptionButtonGroup } from "@/components/common/OptionButtonGroup";
import { NumberStepperInput } from "@/components/common/NumberStepperInput";
import {
  CDC_AGE_OPTIONS,
  EDUCATION_OPTIONS,
  INCOME_OPTIONS,
} from "@/lib/screening-constants";

interface Step1Props {
  register: UseFormRegister<any>;
  control: any;
  errors: FieldErrors<any>;
  heightValue?: number | string;
  weightValue?: number | string;
}

export function ScreeningStep1Demographics({
  register,
  control,
  errors,
  heightValue,
  weightValue,
}: Step1Props) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Thông tin Nhân khẩu học Cơ bản */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-medical-100 dark:bg-medical-900/60 text-medical-600 dark:text-medical-400 flex items-center justify-center text-xs font-black">
              1.1
            </span>
            Thông tin Nhân khẩu học
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Giới tính sinh học */}
            <Controller
              name="Sex"
              control={control}
              render={({ field }) => (
                <OptionButtonGroup
                  label="Giới tính sinh học"
                  description="Dùng để hiệu chỉnh phân tầng nguy cơ theo dịch tễ học CDC"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 1, label: "Nam giới" },
                    { value: 0, label: "Nữ giới" },
                  ]}
                  error={errors.Sex?.message as string}
                />
              )}
            />

            {/* Nhóm tuổi CDC BRFSS - Chuẩn Shadcn UI Select */}
            <Controller
              name="Age"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Nhóm độ tuổi <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="w-full min-h-[44px]">
                      <SelectValue placeholder="Chọn nhóm độ tuổi" />
                    </SelectTrigger>
                    <SelectContent>
                      {CDC_AGE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={String(item.value)}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.Age?.message && (
                    <p className="text-[11px] text-rose-500">{String(errors.Age.message)}</p>
                  )}
                </div>
              )}
            />

            {/* Trình độ học vấn - Chuẩn Shadcn UI Select */}
            <Controller
              name="Education"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Trình độ học vấn
                  </Label>
                  <Select
                    value={field.value ? String(field.value) : "4"}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="w-full min-h-[44px]">
                      <SelectValue placeholder="Chọn trình độ học vấn" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={String(item.value)}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            {/* Khung thu nhập - Chuẩn Shadcn UI Select */}
            <Controller
              name="Income"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Khung thu nhập gia đình
                  </Label>
                  <Select
                    value={field.value ? String(field.value) : "5"}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="w-full min-h-[44px]">
                      <SelectValue placeholder="Chọn khung thu nhập" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={String(item.value)}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Thể trạng & Tính toán BMI thời gian thực (Kèm Stepper +/-) */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-medical-100 dark:bg-medical-900/60 text-medical-600 dark:text-medical-400 flex items-center justify-center text-xs font-black">
              1.2
            </span>
            Chỉ số Thể trạng &amp; BMI
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="170"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.height_cm?.message as string}
                  required
                />
              )}
            />

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
                  icon={Scale}
                  placeholder="65"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.weight_kg?.message as string}
                  required
                />
              )}
            />
          </div>

          {/* Thẻ tính toán BMI theo chuẩn WPRO y tế */}
          <BMICalculatorCard
            heightCm={typeof heightValue === "number" ? heightValue : Number(heightValue) || null}
            weightKg={typeof weightValue === "number" ? weightValue : Number(weightValue) || null}
          />
        </CardContent>
      </Card>

      {/* 3. Thói quen Lối sống & Dinh dưỡng */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-medical-100 dark:bg-medical-900/60 text-medical-600 dark:text-medical-400 flex items-center justify-center text-xs font-black">
              1.3
            </span>
            Thói quen Lối sống &amp; Dinh dưỡng
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="Smoker"
              control={control}
              render={({ field }) => (
                <OptionButtonGroup
                  label="Thói quen hút thuốc lá"
                  description="Bạn đã từng hút ít nhất 100 điếu thuốc lá trong đời?"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="HvyAlcoholConsump"
              control={control}
              render={({ field }) => (
                <OptionButtonGroup
                  label="Uống nhiều rượu bia"
                  description=">14 ly/tuần với nam, hoặc >7 ly/tuần với nữ"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="PhysActivity"
              control={control}
              render={({ field }) => (
                <OptionButtonGroup
                  label="Hoạt động thể lực"
                  description="Tập thể dục, đi bộ nhanh hoặc chơi thể thao trong 30 ngày qua"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="Fruits"
              control={control}
              render={({ field }) => (
                <OptionButtonGroup
                  label="Ăn trái cây hàng ngày"
                  description="Ăn hoa quả tươi ít nhất 1 lần mỗi ngày"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="Veggies"
              control={control}
              render={({ field }) => (
                <OptionButtonGroup
                  label="Ăn rau xanh hàng ngày"
                  description="Bổ sung rau củ quả trong các bữa ăn chính mỗi ngày"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

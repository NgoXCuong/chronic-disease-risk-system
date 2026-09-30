"use client";

import * as React from "react";
import { Controller, FieldErrors } from "react-hook-form";
import { Ruler, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BMICalculatorCard } from "@/components/common/BMICalculatorCard";
import { NumberStepperInput } from "@/components/common/NumberStepperInput";

interface Step1VitalsCardProps {
  control: any;
  errors: FieldErrors<any>;
  heightValue?: number | string;
  weightValue?: number | string;
}

export function Step1VitalsCard({
  control,
  errors,
  heightValue,
  weightValue,
}: Step1VitalsCardProps) {
  const h = typeof heightValue === "number" ? heightValue : Number(heightValue) || null;
  const w = typeof weightValue === "number" ? weightValue : Number(weightValue) || null;

  return (
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

        {/* Thẻ tính toán BMI thời gian thực theo chuẩn WPRO */}
        <BMICalculatorCard heightCm={h} weightKg={w} />
      </CardContent>
    </Card>
  );
}

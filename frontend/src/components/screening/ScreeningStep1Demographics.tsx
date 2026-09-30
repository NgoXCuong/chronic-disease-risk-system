"use client";

import * as React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Step1DemographicsCard } from "./step1/Step1DemographicsCard";
import { Step1VitalsCard } from "./step1/Step1VitalsCard";
import { Step1LifestyleCard } from "./step1/Step1LifestyleCard";

interface Step1Props {
  register?: UseFormRegister<any>;
  control: any;
  errors: FieldErrors<any>;
  heightValue?: number | string;
  weightValue?: number | string;
}

export function ScreeningStep1Demographics({
  control,
  errors,
  heightValue,
  weightValue,
}: Step1Props) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1.1 Thông tin Nhân khẩu học */}
      <Step1DemographicsCard control={control} errors={errors} />

      {/* 1.2 Chỉ số Thể trạng & BMI (Kèm Stepper +/- và tính toán tự động) */}
      <Step1VitalsCard
        control={control}
        errors={errors}
        heightValue={heightValue}
        weightValue={weightValue}
      />

      {/* 1.3 Thói quen Lối sống & Dinh dưỡng */}
      <Step1LifestyleCard control={control} />
    </div>
  );
}

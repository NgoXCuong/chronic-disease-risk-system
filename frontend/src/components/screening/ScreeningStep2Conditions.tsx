"use client";

import * as React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Step2ChronicDiseasesCard } from "./step2/Step2ChronicDiseasesCard";
import { Step2HealthStatusCard } from "./step2/Step2HealthStatusCard";
import { Step2HealthcareAccessCard } from "./step2/Step2HealthcareAccessCard";

interface Step2Props {
  register?: UseFormRegister<any>;
  control: any;
  errors: FieldErrors<any>;
}

export function ScreeningStep2Conditions({ control, errors }: Step2Props) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 2.1 Tiền sử Bệnh lý mạn tính */}
      <Step2ChronicDiseasesCard control={control} />

      {/* 2.2 Sức khỏe Thể chất & Tinh thần (kèm Select và Stepper) */}
      <Step2HealthStatusCard control={control} errors={errors} />

      {/* 2.3 Tiếp cận Dịch vụ Y tế */}
      <Step2HealthcareAccessCard control={control} />
    </div>
  );
}

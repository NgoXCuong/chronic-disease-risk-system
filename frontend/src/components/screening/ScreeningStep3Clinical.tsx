"use client";

import * as React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Step3ClinicalBiomarkersCard } from "./step3/Step3ClinicalBiomarkersCard";
import { Step3ClinicalNotesCard } from "./step3/Step3ClinicalNotesCard";

interface Step3Props {
  register: UseFormRegister<any>;
  control?: any;
  errors: FieldErrors<any>;
  isClinicalEnabled: boolean;
  onToggleClinical: (enabled: boolean) => void;
  isFemale: boolean;
}

export function ScreeningStep3Clinical({
  register,
  errors,
  isClinicalEnabled,
  onToggleClinical,
  isFemale,
}: Step3Props) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 3.1 Kích hoạt Sàng lọc Chuyên sâu Tầng 2 (Pima Clinical Lab) */}
      <Step3ClinicalBiomarkersCard
        register={register}
        errors={errors}
        isClinicalEnabled={isClinicalEnabled}
        onToggleClinical={onToggleClinical}
        isFemale={isFemale}
      />

      {/* 3.2 Ghi chú Triệu chứng & Lịch sử Khám (Tùy chọn) */}
      <Step3ClinicalNotesCard register={register} />
    </div>
  );
}

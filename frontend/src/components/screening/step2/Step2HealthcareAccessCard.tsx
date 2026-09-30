"use client";

import * as React from "react";
import { Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { OptionButtonGroup } from "@/components/common/OptionButtonGroup";

interface Step2HealthcareAccessCardProps {
  control: any;
}

export function Step2HealthcareAccessCard({ control }: Step2HealthcareAccessCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-black">
            2.3
          </span>
          Tiếp cận Dịch vụ Y tế
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="AnyHealthcare"
            control={control}
            render={({ field }) => (
              <OptionButtonGroup
                label="Bảo hiểm y tế"
                description="Bạn có tham gia BHYT hoặc bảo hiểm sức khỏe tư nhân không?"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="NoDocbcCost"
            control={control}
            render={({ field }) => (
              <OptionButtonGroup
                label="Trở ngại chi phí khám bệnh"
                description="Trong 12 tháng qua, bạn có từng không thể đi khám bác sĩ vì lý do chi phí?"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

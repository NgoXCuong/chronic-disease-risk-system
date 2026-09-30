"use client";

import * as React from "react";
import { Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { OptionButtonGroup } from "@/components/common/OptionButtonGroup";

interface Step2ChronicDiseasesCardProps {
  control: any;
}

export function Step2ChronicDiseasesCard({ control }: Step2ChronicDiseasesCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-black">
            2.1
          </span>
          Tiền sử Bệnh lý mạn tính
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="HighBP"
            control={control}
            render={({ field }) => (
              <OptionButtonGroup
                label="Tiền sử Tăng huyết áp"
                description="Bác sĩ từng chẩn đoán bạn bị huyết áp cao hoặc đang uống thuốc hạ áp"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="HighChol"
            control={control}
            render={({ field }) => (
              <OptionButtonGroup
                label="Mỡ máu / Cholesterol cao"
                description="Bác sĩ từng chẩn đoán bạn có nồng độ cholesterol máu cao"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="CholCheck"
            control={control}
            render={({ field }) => (
              <OptionButtonGroup
                label="Kiểm tra Cholesterol trong 5 năm"
                description="Đã từng làm xét nghiệm mỡ máu trong vòng 5 năm qua"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="Stroke"
            control={control}
            render={({ field }) => (
              <OptionButtonGroup
                label="Tiền sử Đột quỵ (Tai biến)"
                description="Từng được chẩn đoán đột quỵ hoặc tai biến mạch máu não"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="HeartDiseaseorAttack"
            control={control}
            render={({ field }) => (
              <OptionButtonGroup
                label="Bệnh mạch vành / Nhồi máu cơ tim"
                description="Từng có cơn đau tim, nhồi máu cơ tim hoặc bệnh tim thiếu máu cục bộ"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="Diabetes_binary"
            control={control}
            render={({ field }) => (
              <OptionButtonGroup
                label="Tiền sử Đái tháo đường"
                description="Từng được chẩn đoán mắc bệnh tiểu đường hoặc tiền đái tháo đường"
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

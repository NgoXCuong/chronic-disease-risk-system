"use client";

import * as React from "react";
import { Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { OptionButtonGroup } from "@/components/common/OptionButtonGroup";

interface Step1LifestyleCardProps {
  control: any;
}

export function Step1LifestyleCard({ control }: Step1LifestyleCardProps) {
  return (
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
  );
}

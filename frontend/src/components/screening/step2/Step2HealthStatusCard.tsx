"use client";

import * as React from "react";
import { Controller, FieldErrors } from "react-hook-form";
import { Activity, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionButtonGroup } from "@/components/common/OptionButtonGroup";
import { NumberStepperInput } from "@/components/common/NumberStepperInput";
import { GEN_HEALTH_OPTIONS } from "@/lib/screening-constants";

interface Step2HealthStatusCardProps {
  control: any;
  errors: FieldErrors<any>;
}

export function Step2HealthStatusCard({ control, errors }: Step2HealthStatusCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-black">
            2.2
          </span>
          Sức khỏe Thể chất &amp; Tinh thần
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tự đánh giá sức khỏe - Chuẩn Shadcn UI Select */}
          <Controller
            name="GenHlth"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Tự đánh giá sức khỏe tổng quát của bản thân <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={field.value ? String(field.value) : "2"}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <SelectTrigger className="w-full min-h-[44px]">
                    <SelectValue placeholder="Đánh giá sức khỏe" />
                  </SelectTrigger>
                  <SelectContent>
                    {GEN_HEALTH_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={String(item.value)}>
                        {item.label} — {item.desc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <Controller
            name="DiffWalk"
            control={control}
            render={({ field }) => (
              <div className="sm:col-span-2">
                <OptionButtonGroup
                  label="Khó khăn đi bộ / leo cầu thang"
                  description="Bạn có gặp khó khăn nghiêm trọng khi đi bộ hoặc leo dốc không?"
                  value={field.value}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          <Controller
            name="PhysHlth"
            control={control}
            render={({ field }) => (
              <NumberStepperInput
                id="PhysHlth"
                label="Số ngày thể chất kém trong tháng (0-30)"
                unit="ngày"
                min={0}
                max={30}
                step={1}
                icon={Activity}
                placeholder="0"
                value={field.value}
                onChange={field.onChange}
                error={errors.PhysHlth?.message as string}
              />
            )}
          />

          <Controller
            name="MentHlth"
            control={control}
            render={({ field }) => (
              <NumberStepperInput
                id="MentHlth"
                label="Số ngày căng thẳng lo âu trong tháng (0-30)"
                unit="ngày"
                min={0}
                max={30}
                step={1}
                icon={Brain}
                placeholder="0"
                value={field.value}
                onChange={field.onChange}
                error={errors.MentHlth?.message as string}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

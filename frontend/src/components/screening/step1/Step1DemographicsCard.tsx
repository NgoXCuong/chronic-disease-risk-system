"use client";

import * as React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
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
import {
  CDC_AGE_OPTIONS,
  EDUCATION_OPTIONS,
  INCOME_OPTIONS,
} from "@/lib/screening-constants";

interface Step1DemographicsCardProps {
  control: any;
  errors: FieldErrors<any>;
}

export function Step1DemographicsCard({ control, errors }: Step1DemographicsCardProps) {
  return (
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
                  <p className="text-[11px] text-rose-500 font-medium">{String(errors.Age.message)}</p>
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
  );
}

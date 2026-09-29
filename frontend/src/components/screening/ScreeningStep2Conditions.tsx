"use client";

import * as React from "react";
import { Control, Controller, FieldErrors, UseFormRegister } from "react-hook-form";
import { Activity, Brain, Heart, ShieldAlert, Smile, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { OptionButtonGroup } from "@/components/common/OptionButtonGroup";
import { GEN_HEALTH_OPTIONS } from "@/lib/screening-constants";

interface Step2Props {
  register: UseFormRegister<any>;
  control: any;
  errors: FieldErrors<any>;
}

export function ScreeningStep2Conditions({
  register,
  control,
  errors,
}: Step2Props) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 2.1 Tiền sử Bệnh lý mạn tính */}
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

      {/* 2.2 Đánh giá Sức khỏe Tổng quát & Thể trạng */}
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
                <OptionButtonGroup
                  label="Khó khăn đi bộ / leo cầu thang"
                  description="Bạn có gặp khó khăn nghiêm trọng khi đi bộ hoặc leo dốc không?"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <MedicalInputField
              id="PhysHlth"
              type="number"
              min="0"
              max="30"
              label="Số ngày đau ốm / thể chất kém trong tháng (0-30)"
              icon={Activity}
              placeholder="0"
              error={errors.PhysHlth?.message as string}
              {...register("PhysHlth", { valueAsNumber: true })}
            />

            <MedicalInputField
              id="MentHlth"
              type="number"
              min="0"
              max="30"
              label="Số ngày căng thẳng / tinh thần lo âu trong tháng (0-30)"
              icon={Brain}
              placeholder="0"
              error={errors.MentHlth?.message as string}
              {...register("MentHlth", { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2.3 Tiếp cận Y tế */}
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
    </div>
  );
}

"use client";

import * as React from "react";
import { UseFormRegister } from "react-hook-form";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Step3ClinicalNotesCardProps {
  register: UseFormRegister<any>;
}

export function Step3ClinicalNotesCard({ register }: Step3ClinicalNotesCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-medical-600" />
          Ghi chú Triệu chứng &amp; Lịch sử Khám (Tùy chọn)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Nhập các dấu hiệu bất thường, tiền sử phẫu thuật hoặc thuốc đang điều trị để lưu vết trong hồ sơ theo dõi sức khỏe.
        </p>
        <Textarea
          id="screening-notes"
          {...register("notes")}
          rows={3}
          placeholder="Ví dụ: Thường xuyên khát nước vào ban đêm, đang dùng thuốc hạ áp theo đơn..."
        />
      </CardContent>
    </Card>
  );
}

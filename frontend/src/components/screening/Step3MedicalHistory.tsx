import React from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  Heart,
  Activity,
  Droplet,
  ShieldCheck,
  Brain,
  CreditCard,
  FileEdit,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScreeningFormValues } from "@/lib/validations/screening";

interface Props {
  register: UseFormRegister<ScreeningFormValues>;
  setValue: UseFormSetValue<ScreeningFormValues>;
  watch: UseFormWatch<ScreeningFormValues>;
}

export function Step3MedicalHistory({ register, setValue, watch }: Props) {
  const highBP = watch("HighBP");
  const highChol = watch("HighChol");
  const cholCheck = watch("CholCheck");
  const stroke = watch("Stroke");
  const heartDisease = watch("HeartDiseaseorAttack");
  const anyHealthcare = watch("AnyHealthcare");
  const noDocbcCost = watch("NoDocbcCost");

  const medicalConditions = [
    {
      key: "HighBP" as const,
      value: highBP,
      title: "Tăng huyết áp",
      desc: "Từng được bác sĩ hoặc nhân viên y tế chẩn đoán có huyết áp cao?",
      icon: Activity,
    },
    {
      key: "HighChol" as const,
      value: highChol,
      title: "Mỡ máu / Cholesterol cao",
      desc: "Từng được thông báo có chỉ số cholesterol hoặc mỡ máu trong máu cao?",
      icon: Droplet,
    },
    {
      key: "CholCheck" as const,
      value: cholCheck,
      title: "Kiểm tra Cholesterol trong 5 năm",
      desc: "Đã từng đi xét nghiệm kiểm tra mỡ máu trong vòng 5 năm trở lại đây?",
      icon: ShieldCheck,
    },
    {
      key: "HeartDiseaseorAttack" as const,
      value: heartDisease,
      title: "Bệnh tim mạch / Đau tim",
      desc: "Tiền sử từng bị nhồi máu cơ tim hoặc bệnh động mạch vành?",
      icon: Heart,
    },
    {
      key: "Stroke" as const,
      value: stroke,
      title: "Đột quỵ (Tai biến mạch máu não)",
      desc: "Từng có cơn tai biến, thiếu máu não thoáng qua hoặc đột quỵ não?",
      icon: Brain,
    },
    {
      key: "AnyHealthcare" as const,
      value: anyHealthcare,
      title: "Bảo hiểm y tế",
      desc: "Hiện tại có đang tham gia bảo hiểm y tế hoặc gói chăm sóc sức khỏe nào?",
      icon: ShieldCheck,
    },
    {
      key: "NoDocbcCost" as const,
      value: noDocbcCost,
      title: "Rào cản chi phí y tế",
      desc: "Trong 12 tháng qua, có lần nào bạn cần đi khám nhưng không thể đi vì lý do tài chính?",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Khối 1: Danh sách Tiền sử bệnh lý */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Tiền sử Bệnh lý & Tiếp cận Y tế
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {medicalConditions.map((item) => (
            <div
              key={item.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mt-0.5">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  type="button"
                  variant={item.value === 1 ? "default" : "outline"}
                  onClick={() => setValue(item.key, 1, { shouldValidate: true })}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold ${
                    item.value === 1
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Có
                </Button>
                <Button
                  type="button"
                  variant={item.value === 0 ? "default" : "outline"}
                  onClick={() => setValue(item.key, 0, { shouldValidate: true })}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold ${
                    item.value === 0
                      ? "bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-700"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Không
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Khối 2: Ghi chú lâm sàng bổ sung */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <Label htmlFor="notes" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <FileEdit className="h-4 w-4 text-slate-400" />
          Ghi chú sức khỏe hoặc triệu chứng bổ sung (Tùy chọn)
        </Label>
        <Textarea
          id="notes"
          placeholder="Ví dụ: Đang uống thuốc điều trị huyết áp định kỳ, gia đình có bố mắc đái tháo đường týp 2..."
          className="rounded-xl border-slate-200 dark:border-slate-800 min-h-[85px] text-xs resize-none"
          {...register("notes")}
        />
        <p className="text-[11px] text-slate-400">
          Thông tin này sẽ được lưu kèm bản ghi để bác sĩ hoặc chuyên viên y tế tham vấn sau này.
        </p>
      </div>
    </div>
  );
}

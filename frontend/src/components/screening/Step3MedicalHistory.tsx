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
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { Label } from "@/components/ui/label";
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

  // 1. Nhóm Bệnh lý Tim mạch & Não
  const cardiovascularConditions = [
    {
      key: "HighBP" as const,
      value: highBP,
      title: "Tăng huyết áp nguyên phát",
      desc: "Từng được bác sĩ hoặc cơ sở y tế chẩn đoán có huyết áp cao (≥ 140/90 mmHg)?",
      icon: Activity,
    },
    {
      key: "HeartDiseaseorAttack" as const,
      value: heartDisease,
      title: "Bệnh tim mạch / Đau tim",
      desc: "Tiền sử nhồi máu cơ tim, hẹp động mạch vành hoặc suy tim sung huyết?",
      icon: Heart,
    },
    {
      key: "Stroke" as const,
      value: stroke,
      title: "Đột quỵ não (Tai biến mạch máu não)",
      desc: "Từng có cơn đột quỵ, xuất huyết não hoặc thiếu máu não cục bộ thoáng qua (TIA)?",
      icon: Brain,
    },
  ];

  // 2. Nhóm Chuyển hóa & Xét nghiệm Lipid máu
  const metabolicConditions = [
    {
      key: "HighChol" as const,
      value: highChol,
      title: "Rối loạn mỡ máu (Cholesterol cao)",
      desc: "Từng được thông báo có chỉ số mỡ máu (Cholesterol toàn phần hoặc LDL) tăng cao?",
      icon: Droplet,
    },
    {
      key: "CholCheck" as const,
      value: cholCheck,
      title: "Kiểm tra xét nghiệm Cholesterol trong 5 năm",
      desc: "Có từng đi xét nghiệm máu kiểm tra bilan mỡ máu định kỳ trong vòng 5 năm qua?",
      icon: Stethoscope,
      isProtective: true, // Hành vi bảo vệ sức khỏe
    },
  ];

  // 3. Nhóm Điều kiện Tiếp cận Y tế
  const healthcareAccess = [
    {
      key: "AnyHealthcare" as const,
      value: anyHealthcare,
      title: "Bảo hiểm y tế (BHYT)",
      desc: "Hiện tại có đang tham gia bảo hiểm y tế hoặc gói bảo hiểm sức khỏe nào?",
      icon: ShieldCheck,
      isProtective: true,
    },
    {
      key: "NoDocbcCost" as const,
      value: noDocbcCost,
      title: "Trở ngại chi phí khám chữa bệnh",
      desc: "Trong 12 tháng qua, có lần nào bạn cần khám bệnh nhưng phải bỏ qua vì lý do tài chính?",
      icon: CreditCard,
    },
  ];

  const renderSection = (title: string, subtitle: string, items: typeof cardiovascularConditions) => (
    <div className="space-y-3">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-1.5">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          {title}
        </h4>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {items.map((item) => {
          const isYes = item.value === 1;
          const isNo = item.value === 0;
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all gap-3 ${
                isYes
                  ? (item as any).isProtective
                    ? "border-teal-500/80 bg-teal-50/40 dark:bg-teal-950/30"
                    : "border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/30"
                  : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
                    isYes
                      ? (item as any).isProtective
                        ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300"
                        : "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
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
                <button
                  type="button"
                  onClick={() => setValue(item.key, 1, { shouldValidate: true })}
                  className={`h-9 px-4 rounded-xl text-xs font-bold transition-all min-w-[64px] border ${
                    isYes
                      ? (item as any).isProtective
                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                        : "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  Có
                </button>
                <button
                  type="button"
                  onClick={() => setValue(item.key, 0, { shouldValidate: true })}
                  className={`h-9 px-4 rounded-xl text-xs font-bold transition-all min-w-[64px] border ${
                    isNo
                      ? "bg-slate-700 dark:bg-slate-700 text-white border-slate-700"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  Không
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Thông báo hướng dẫn y tế */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200">
        <AlertCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Tiền sử bệnh lý của bản thân và gia đình là những yếu tố có trọng số giải thích (SHAP) rất lớn trong mô hình dự đoán. Hãy tích chọn chính xác theo chẩn đoán gần nhất của bác sĩ.
        </p>
      </div>

      {/* Nhóm 1: Tim mạch & Não */}
      {renderSection(
        "1. Tiền sử Bệnh lý Tim mạch & Não bộ",
        "Các bệnh lý mạch máu nguy cơ cao",
        cardiovascularConditions
      )}

      {/* Nhóm 2: Chuyển hóa & Mỡ máu */}
      {renderSection(
        "2. Rối loạn Chuyển hóa & Xét nghiệm Sinh hóa",
        "Chỉ số mỡ máu và thói quen xét nghiệm định kỳ",
        metabolicConditions as any
      )}

      {/* Nhóm 3: Tiếp cận Y tế */}
      {renderSection(
        "3. Điều kiện Tiếp cận Dịch vụ Y tế",
        "Khả năng chi trả và tham gia bảo hiểm y tế",
        healthcareAccess as any
      )}

      {/* Khối 4: Ghi chú lâm sàng tự do */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
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
          Thông tin này sẽ được lưu kèm hồ sơ để trợ lý y tế AI (RAG) hoặc bác sĩ tham vấn sau này.
        </p>
      </div>
    </div>
  );
}

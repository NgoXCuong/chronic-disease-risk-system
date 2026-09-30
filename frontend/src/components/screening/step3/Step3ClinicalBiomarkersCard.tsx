"use client";

import * as React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Activity, Baby, Dna, Droplet, HeartPulse, Microscope, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MedicalInputField } from "@/components/common/MedicalInputField";

interface Step3ClinicalBiomarkersCardProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  isClinicalEnabled: boolean;
  onToggleClinical: (enabled: boolean) => void;
  isFemale: boolean;
}

export function Step3ClinicalBiomarkersCard({
  register,
  errors,
  isClinicalEnabled,
  onToggleClinical,
  isFemale,
}: Step3ClinicalBiomarkersCardProps) {
  return (
    <Card className={isClinicalEnabled ? "border-medical-500 shadow-sm" : ""}>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-black">
                Tầng 2
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Xét nghiệm Sinh hóa Lâm sàng (Tùy chọn)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kích hoạt mô hình Đái tháo đường Chuyên sâu (Pima Indian) nếu bạn có kết quả xét nghiệm máu gần đây.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleClinical(!isClinicalEnabled)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-center gap-2 shrink-0 ${
              isClinicalEnabled
                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            }`}
          >
            <Microscope className="w-4 h-4" />
            <span>{isClinicalEnabled ? "Đã bật Xét nghiệm Lâm sàng" : "+ Thêm chỉ số Xét nghiệm"}</span>
          </button>
        </div>

        {isClinicalEnabled ? (
          <div className="space-y-4 pt-2">
            <Alert variant="info">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <AlertDescription>
                Các chỉ số xét nghiệm giúp mô hình XGBoost Calibrated đạt độ chính xác lâm sàng cao hơn và cung cấp phân tích SHAP chi tiết về chuyển hóa đường huyết.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MedicalInputField
                id="clinical_glucose"
                type="number"
                step="1"
                label="Glucose huyết tương lúc đói (mg/dL)"
                required
                icon={Droplet}
                placeholder="Ví dụ: 95 (Bình thường: 70 - 99)"
                error={errors.clinical_glucose?.message as string}
                {...register("clinical_glucose", { valueAsNumber: true })}
              />

              <MedicalInputField
                id="clinical_blood_pressure"
                type="number"
                step="1"
                label="Huyết áp tâm trương (mmHg)"
                required
                icon={HeartPulse}
                placeholder="Ví dụ: 80 (Bình thường: 60 - 80)"
                error={errors.clinical_blood_pressure?.message as string}
                {...register("clinical_blood_pressure", { valueAsNumber: true })}
              />

              <MedicalInputField
                id="clinical_insulin"
                type="number"
                step="1"
                label="Nồng độ Insulin huyết thanh 2 giờ (mu U/ml)"
                icon={Activity}
                placeholder="Mặc định: 80"
                error={errors.clinical_insulin?.message as string}
                {...register("clinical_insulin", { valueAsNumber: true })}
              />

              <MedicalInputField
                id="clinical_skin_thickness"
                type="number"
                step="1"
                label="Độ dày nếp gấp da cơ tam đầu (mm)"
                icon={Activity}
                placeholder="Mặc định: 20"
                error={errors.clinical_skin_thickness?.message as string}
                {...register("clinical_skin_thickness", { valueAsNumber: true })}
              />

              <MedicalInputField
                id="clinical_dpf"
                type="number"
                step="0.01"
                label="Chỉ số phả hệ di truyền tiểu đường (DPF)"
                icon={Dna}
                placeholder="Mặc định: 0.47"
                error={errors.clinical_dpf?.message as string}
                {...register("clinical_dpf", { valueAsNumber: true })}
              />

              {isFemale && (
                <MedicalInputField
                  id="clinical_pregnancies"
                  type="number"
                  min="0"
                  max="20"
                  label="Số lần mang thai (Pregnancies)"
                  icon={Baby}
                  placeholder="0"
                  error={errors.clinical_pregnancies?.message as string}
                  {...register("clinical_pregnancies", { valueAsNumber: true })}
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            (Nếu bạn không có xét nghiệm máu, hệ thống vẫn sàng lọc toàn diện 4 bệnh mạn tính bằng mô hình Lối sống CDC BRFSS ở Tầng 1)
          </p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, ArrowRight, BrainCircuit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScreeningStepper } from "@/components/screening/ScreeningStepper";
import { ScreeningStep1Demographics } from "@/components/screening/ScreeningStep1Demographics";
import { ScreeningStep2Conditions } from "@/components/screening/ScreeningStep2Conditions";
import { ScreeningStep3Clinical } from "@/components/screening/ScreeningStep3Clinical";
import { DisclaimerModal } from "@/components/screening/DisclaimerModal";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import {
  buildScreeningPayloads,
  getScreeningDefaultValues,
  ScreeningFormValues,
  screeningWizardSchema,
} from "@/lib/screening-schema";

export default function ScreeningWizardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<ScreeningFormValues>({
    resolver: zodResolver(screeningWizardSchema),
    defaultValues: getScreeningDefaultValues(user),
    mode: "onChange",
  });

  const watchedHeight = useWatch({ control, name: "height_cm" });
  const watchedWeight = useWatch({ control, name: "weight_kg" });
  const watchedSex = useWatch({ control, name: "Sex" });
  const watchedClinical = useWatch({ control, name: "is_clinical_enabled" });

  // Kiểm tra tính hợp lệ của từng bước trước khi cho phép Next
  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger([
        "Sex", "Age", "height_cm", "weight_kg", "Education",
        "Income", "Smoker", "HvyAlcoholConsump", "PhysActivity", "Fruits", "Veggies",
      ]);
    } else if (currentStep === 2) {
      isValid = await trigger([
        "HighBP", "HighChol", "CholCheck", "Stroke", "HeartDiseaseorAttack",
        "Diabetes_binary", "GenHlth", "DiffWalk", "PhysHlth", "MentHlth",
        "AnyHealthcare", "NoDocbcCost",
      ]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenDisclaimer = async () => {
    if (await trigger()) {
      setModalOpen(true);
    }
  };

  // Gửi dữ liệu lên Backend FastAPI AI Inference Engine
  const executeAiScreening = async (values: ScreeningFormValues) => {
    try {
      setIsSubmitting(true);
      setApiError(null);

      const { lifestylePayload, clinicalPayload } = buildScreeningPayloads(values);

      // 1. Gửi phân tích toàn diện 4 mô hình Tầng 1
      const res = await api.post("/screening/comprehensive", lifestylePayload);
      const comprehensiveResults = res.data;

      const firstKey = Object.keys(comprehensiveResults)[0];
      const recordId = comprehensiveResults[firstKey]?.record_id;

      // 2. Gửi phân tích lâm sàng Tầng 2 nếu kích hoạt
      if (clinicalPayload) {
        await api.post("/screening/predict/clinical/diabetes", clinicalPayload);
      }

      setModalOpen(false);
      router.push(recordId ? `/screening/result?record_id=${recordId}` : "/dashboard");
    } catch (err: any) {
      setApiError(err.message || "Quá trình phân tích AI gặp sự cố. Vui lòng kiểm tra lại kết nối.");
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Khảo sát Sàng lọc Đa tầng
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hệ thống CDSS đánh giá đồng thời 4 bệnh mạn tính bằng Machine Learning và trích xuất giải thích SHAP
        </p>
      </div>

      <ScreeningStepper currentStep={currentStep} />

      {apiError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(executeAiScreening)}>
        {currentStep === 1 && (
          <ScreeningStep1Demographics
            register={register}
            control={control}
            errors={errors}
            heightValue={watchedHeight}
            weightValue={watchedWeight}
          />
        )}

        {currentStep === 2 && (
          <ScreeningStep2Conditions
            register={register}
            control={control}
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <ScreeningStep3Clinical
            register={register}
            control={control}
            errors={errors}
            isClinicalEnabled={watchedClinical}
            onToggleClinical={(enabled) => setValue("is_clinical_enabled", enabled)}
            isFemale={watchedSex === 0}
          />
        )}

        {/* Thanh điều khiển chuyển bước */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="gap-2 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="gap-2 min-h-[44px] shadow-sm"
              >
                Tiếp tục <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleOpenDisclaimer}
                disabled={isSubmitting}
                className="gap-2 min-h-[44px] bg-medical-600 hover:bg-medical-700 shadow-md font-bold"
              >
                {isSubmitting ? (
                  "Đang phân tích..."
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" /> Hoàn tất &amp; Phân tích AI
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      <DisclaimerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleSubmit(executeAiScreening)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

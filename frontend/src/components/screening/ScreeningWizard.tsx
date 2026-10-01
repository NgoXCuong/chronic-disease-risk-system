"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  screeningWizardSchema,
  ScreeningFormValues,
  getScreeningDefaultValues,
  buildScreeningPayload,
} from "@/lib/validations/screening";
import { screeningApi } from "@/lib/api/screening";
import { ScreeningStepHeader } from "./ScreeningStepHeader";
import { Step1Demographics } from "./Step1Demographics";
import { Step2Lifestyle } from "./Step2Lifestyle";
import { Step3MedicalHistory } from "./Step3MedicalHistory";
import { DisclaimerConfirmDialog } from "./DisclaimerConfirmDialog";

export function ScreeningWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScreeningFormValues>({
    resolver: zodResolver(screeningWizardSchema),
    defaultValues: getScreeningDefaultValues(user),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = form;

  // Tự động điền dữ liệu (pre-fill) khi user load xong
  useEffect(() => {
    if (user?.profile) {
      reset(getScreeningDefaultValues(user));
    }
  }, [user, reset]);

  // Điều hướng sang bước tiếp theo kèm kiểm duyệt dữ liệu & tự động cuộn lên đầu
  const handleNextStep = async () => {
    if (currentStep === 1) {
      const valid = await trigger([
        "Sex",
        "Age",
        "height_cm",
        "weight_kg",
        "Education",
        "Income",
      ]);
      if (valid) {
        setCurrentStep(2);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 120, behavior: "smooth" });
        }
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
    }
  };

  // Xác nhận từ Disclaimer Dialog -> Gọi API suy luận 5 mô hình ML
  const handleConfirmPredict = async () => {
    try {
      setIsSubmitting(true);
      const values = form.getValues();
      const payload = buildScreeningPayload(values);

      const response = await screeningApi.predictComprehensive(payload);

      // Lưu kết quả vào sessionStorage để trang Result hiển thị
      if (typeof window !== "undefined") {
        sessionStorage.setItem("last_screening_result", JSON.stringify(response));
        sessionStorage.setItem("last_screening_input", JSON.stringify(payload));
      }

      toast.success("Phân tích hoàn tất! Đang chuyển đến báo cáo nguy cơ...");
      setDialogOpen(false);
      router.push("/screening/result");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Không thể thực hiện suy luận. Vui lòng kiểm tra lại kết nối.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Thanh Stepper 3 bước cải tiến */}
      <ScreeningStepHeader currentStep={currentStep} />

      {/* Thông báo lỗi validation nếu có */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mb-6 rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold">Vui lòng kiểm tra lại dữ liệu</AlertTitle>
          <AlertDescription className="text-xs">
            Một số trường thông tin chưa đạt tiêu chuẩn y học. Hãy xem lại các ô có viền đỏ.
          </AlertDescription>
        </Alert>
      )}

      {/* Form nội dung theo từng bước */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none transition-all">
        {currentStep === 1 && (
          <Step1Demographics
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
        )}

        {currentStep === 2 && (
          <Step2Lifestyle
            register={register}
            setValue={setValue}
            watch={watch}
          />
        )}

        {currentStep === 3 && (
          <Step3MedicalHistory
            register={register}
            setValue={setValue}
            watch={watch}
          />
        )}

        {/* Nút bấm Điều hướng giữa các bước */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 gap-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              className="h-11 min-h-[44px] px-5 rounded-xl text-xs font-semibold gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Dữ liệu được bảo mật y tế tuyệt đối</span>
            </div>
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="h-11 min-h-[44px] px-7 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2 shadow-sm shadow-teal-600/20"
            >
              Tiếp tục bước {currentStep + 1} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="h-11 min-h-[44px] px-7 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2 shadow-md shadow-teal-600/25 hover:scale-[1.02] transition-transform"
            >
              <Sparkles className="h-4 w-4" />
              Phân tích Nguy cơ (5 Model ML)
            </Button>
          )}
        </div>
      </div>

      {/* Modal Cam kết Miễn trừ Trách nhiệm Y tế (FR-09) */}
      <DisclaimerConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmPredict}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { ScreeningStepper } from "@/components/screening/ScreeningStepper";
import { ScreeningStep1Demographics } from "@/components/screening/ScreeningStep1Demographics";
import { ScreeningStep2Conditions } from "@/components/screening/ScreeningStep2Conditions";
import { ScreeningStep3Clinical } from "@/components/screening/ScreeningStep3Clinical";
import { DisclaimerModal } from "@/components/screening/DisclaimerModal";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { calculateCdcAgeCategory } from "@/lib/screening-constants";

const screeningWizardSchema = z.object({
  // Bước 1: Nhân khẩu học & Thể chất
  Sex: z.number().min(0).max(1),
  Age: z.number().min(1).max(13),
  Education: z.number().min(1).max(6).default(4),
  Income: z.number().min(1).max(8).default(5),
  height_cm: z.number({ invalid_type_error: "Vui lòng nhập chiều cao hợp lệ." }).min(50, "Chiều cao tối thiểu 50cm.").max(250, "Chiều cao tối đa 250cm."),
  weight_kg: z.number({ invalid_type_error: "Vui lòng nhập cân nặng hợp lệ." }).min(20, "Cân nặng tối thiểu 20kg.").max(300, "Cân nặng tối đa 300kg."),
  Smoker: z.number().min(0).max(1).default(0),
  HvyAlcoholConsump: z.number().min(0).max(1).default(0),
  PhysActivity: z.number().min(0).max(1).default(1),
  Fruits: z.number().min(0).max(1).default(1),
  Veggies: z.number().min(0).max(1).default(1),

  // Bước 2: Bệnh lý nền & Sức khỏe
  HighBP: z.number().min(0).max(1).default(0),
  HighChol: z.number().min(0).max(1).default(0),
  CholCheck: z.number().min(0).max(1).default(1),
  Stroke: z.number().min(0).max(1).default(0),
  HeartDiseaseorAttack: z.number().min(0).max(1).default(0),
  Diabetes_binary: z.number().min(0).max(1).default(0),
  GenHlth: z.number().min(1).max(5).default(2),
  DiffWalk: z.number().min(0).max(1).default(0),
  PhysHlth: z.number().min(0).max(30).default(0),
  MentHlth: z.number().min(0).max(30).default(0),
  AnyHealthcare: z.number().min(0).max(1).default(1),
  NoDocbcCost: z.number().min(0).max(1).default(0),

  // Bước 3: Lâm sàng (Tùy chọn) & Ghi chú
  is_clinical_enabled: z.boolean().default(false),
  clinical_glucose: z.number().min(40).max(500).optional(),
  clinical_blood_pressure: z.number().min(30).max(200).optional(),
  clinical_insulin: z.number().min(5).max(900).optional(),
  clinical_skin_thickness: z.number().min(5).max(100).optional(),
  clinical_dpf: z.number().min(0.05).max(3.0).optional(),
  clinical_pregnancies: z.number().min(0).max(20).optional(),
  notes: z.string().max(1000).optional(),
});

type ScreeningFormValues = z.infer<typeof screeningWizardSchema>;

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
    defaultValues: {
      Sex: user?.profile?.gender === "FEMALE" ? 0 : 1,
      Age: calculateCdcAgeCategory(user?.profile?.date_of_birth),
      height_cm: user?.profile?.height_cm || 165,
      weight_kg: user?.profile?.weight_kg || 60,
      Education: 4,
      Income: 5,
      Smoker: 0,
      HvyAlcoholConsump: 0,
      PhysActivity: 1,
      Fruits: 1,
      Veggies: 1,
      HighBP: 0,
      HighChol: 0,
      CholCheck: 1,
      Stroke: 0,
      HeartDiseaseorAttack: 0,
      Diabetes_binary: 0,
      GenHlth: 2,
      DiffWalk: 0,
      PhysHlth: 0,
      MentHlth: 0,
      AnyHealthcare: 1,
      NoDocbcCost: 0,
      is_clinical_enabled: false,
      clinical_glucose: 95,
      clinical_blood_pressure: 80,
      clinical_insulin: 80,
      clinical_skin_thickness: 20,
      clinical_dpf: 0.47,
      clinical_pregnancies: 0,
    },
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
        "Sex",
        "Age",
        "height_cm",
        "weight_kg",
        "Education",
        "Income",
        "Smoker",
        "HvyAlcoholConsump",
        "PhysActivity",
        "Fruits",
        "Veggies",
      ]);
    } else if (currentStep === 2) {
      isValid = await trigger([
        "HighBP",
        "HighChol",
        "CholCheck",
        "Stroke",
        "HeartDiseaseorAttack",
        "Diabetes_binary",
        "GenHlth",
        "DiffWalk",
        "PhysHlth",
        "MentHlth",
        "AnyHealthcare",
        "NoDocbcCost",
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

  // Kích hoạt Modal cam kết y tế khi hoàn thành Form
  const handleOpenDisclaimer = async () => {
    const isValid = await trigger();
    if (isValid) {
      setModalOpen(true);
    }
  };

  // Thực thi gửi dữ liệu lên Backend FastAPI AI Inference Engine
  const executeAiScreening = async (values: ScreeningFormValues) => {
    try {
      setIsSubmitting(true);
      setApiError(null);

      // 1. Tính toán BMI thực tế
      const heightM = values.height_cm / 100;
      const bmi = Number((values.weight_kg / (heightM * heightM)).toFixed(1));

      // 2. Chuẩn bị Payload Tầng 1: BRFSS Comprehensive Screening
      const lifestylePayload = {
        HighBP: values.HighBP,
        HighChol: values.HighChol,
        CholCheck: values.CholCheck,
        BMI: bmi,
        Smoker: values.Smoker,
        Stroke: values.Stroke,
        HeartDiseaseorAttack: values.HeartDiseaseorAttack,
        Diabetes_binary: values.Diabetes_binary,
        PhysActivity: values.PhysActivity,
        Fruits: values.Fruits,
        Veggies: values.Veggies,
        HvyAlcoholConsump: values.HvyAlcoholConsump,
        AnyHealthcare: values.AnyHealthcare,
        NoDocbcCost: values.NoDocbcCost,
        GenHlth: values.GenHlth,
        MentHlth: values.MentHlth,
        PhysHlth: values.PhysHlth,
        DiffWalk: values.DiffWalk,
        Sex: values.Sex,
        Age: values.Age,
        Education: values.Education,
        Income: values.Income,
        notes: values.notes || undefined,
      };

      // Gửi yêu cầu phân tích toàn diện 4 mô hình Tầng 1
      const res = await api.post("/screening/comprehensive", lifestylePayload);
      const comprehensiveResults = res.data;

      // Trích xuất record_id đã được lưu trong CSDL
      const firstDiseaseKey = Object.keys(comprehensiveResults)[0];
      const recordId = comprehensiveResults[firstDiseaseKey]?.record_id;

      // 3. Nếu người dùng bật Sàng lọc Lâm sàng Tầng 2 (Pima Indian)
      if (values.is_clinical_enabled && values.clinical_glucose && values.clinical_blood_pressure) {
        // Ước lượng số tuổi từ nhóm tuổi CDC
        const estimatedAge = values.Age * 5 + 15;
        const clinicalPayload = {
          Pregnancies: values.Sex === 0 ? values.clinical_pregnancies || 0 : 0,
          Glucose: values.clinical_glucose,
          BloodPressure: values.clinical_blood_pressure,
          SkinThickness: values.clinical_skin_thickness || 20,
          Insulin: values.clinical_insulin || 80,
          BMI: bmi,
          DiabetesPedigreeFunction: values.clinical_dpf || 0.47,
          Age: estimatedAge,
          notes: values.notes || undefined,
        };

        await api.post("/screening/predict/clinical/diabetes", clinicalPayload);
      }

      setModalOpen(false);

      // Chuyển hướng sang trang kết quả hoặc dashboard nếu record_id sẵn sàng
      if (recordId) {
        router.push(`/screening/result?record_id=${recordId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setApiError(err.message || "Quá trình phân tích AI gặp sự cố. Vui lòng kiểm tra lại kết nối mạng.");
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tiêu đề trang Sàng lọc */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Khảo sát Sàng lọc Đa tầng
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hệ thống CDSS đánh giá đồng thời 4 bệnh mạn tính bằng Machine Learning và trích xuất giải thích SHAP
        </p>
      </div>

      {/* Stepper điều hướng 3 bước */}
      <ScreeningStepper currentStep={currentStep} />

      {apiError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Nội dung Biểu mẫu từng bước */}
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

        {/* Thanh Điều khiển Chuyển Bước */}
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

      {/* Modal Cam kết Miễn trừ Trách nhiệm Y tế */}
      <DisclaimerModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleSubmit(executeAiScreening)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

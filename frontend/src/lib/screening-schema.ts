import * as z from "zod";
import { calculateCdcAgeCategory } from "@/lib/screening-constants";

export const screeningWizardSchema = z.object({
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

export type ScreeningFormValues = z.infer<typeof screeningWizardSchema>;

export function getScreeningDefaultValues(user: any): ScreeningFormValues {
  return {
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
  };
}

export function buildScreeningPayloads(values: ScreeningFormValues) {
  const heightM = values.height_cm / 100;
  const bmi = Number((values.weight_kg / (heightM * heightM)).toFixed(1));

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

  const estimatedAge = values.Age * 5 + 15;
  const clinicalPayload = values.is_clinical_enabled && values.clinical_glucose && values.clinical_blood_pressure
    ? {
        Pregnancies: values.Sex === 0 ? values.clinical_pregnancies || 0 : 0,
        Glucose: values.clinical_glucose,
        BloodPressure: values.clinical_blood_pressure,
        SkinThickness: values.clinical_skin_thickness || 20,
        Insulin: values.clinical_insulin || 80,
        BMI: bmi,
        DiabetesPedigreeFunction: values.clinical_dpf || 0.47,
        Age: estimatedAge,
        notes: values.notes || undefined,
      }
    : null;

  return { lifestylePayload, clinicalPayload };
}

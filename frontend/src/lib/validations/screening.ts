import * as z from "zod";
import { calculateCdcAgeCategory } from "@/lib/screening-constants";
import { LifestyleScreeningPayload } from "@/types/screening";

export const screeningWizardSchema = z.object({
  // Bước 1: Nhân khẩu học & Thể chất cơ sở
  Sex: z.number().min(0).max(1),
  Age: z.number().min(1).max(13),
  height_cm: z.number().min(50, "Chiều cao tối thiểu 50 cm.").max(250, "Chiều cao tối đa 250 cm."),
  weight_kg: z.number().min(20, "Cân nặng tối thiểu 20 kg.").max(300, "Cân nặng tối đa 300 kg."),
  Education: z.number().min(1).max(6),
  Income: z.number().min(1).max(8),

  // Bước 2: Thói quen Lối sống & Sức khỏe Tự đánh giá
  Smoker: z.number().min(0).max(1),
  HvyAlcoholConsump: z.number().min(0).max(1),
  PhysActivity: z.number().min(0).max(1),
  Fruits: z.number().min(0).max(1),
  Veggies: z.number().min(0).max(1),
  GenHlth: z.number().min(1).max(5),
  PhysHlth: z.number().min(0).max(30),
  MentHlth: z.number().min(0).max(30),
  DiffWalk: z.number().min(0).max(1),

  // Bước 3: Tiền sử Y tế & Tiếp cận Chăm sóc
  HighBP: z.number().min(0).max(1),
  HighChol: z.number().min(0).max(1),
  CholCheck: z.number().min(0).max(1),
  Stroke: z.number().min(0).max(1),
  HeartDiseaseorAttack: z.number().min(0).max(1),
  Diabetes_binary: z.number().min(0).max(1),
  AnyHealthcare: z.number().min(0).max(1),
  NoDocbcCost: z.number().min(0).max(1),
  notes: z.string().max(1000).optional(),
});

export type ScreeningFormValues = z.infer<typeof screeningWizardSchema>;

/**
 * Trích xuất giá trị mặc định cho biểu mẫu sàng lọc từ hồ sơ người dùng (Pre-fill)
 */
export function getScreeningDefaultValues(user: any): ScreeningFormValues {
  const profile = user?.profile;
  const isFemale = profile?.gender === "FEMALE";

  return {
    Sex: isFemale ? 0 : 1,
    Age: calculateCdcAgeCategory(profile?.date_of_birth),
    height_cm: profile?.height_cm || 165,
    weight_kg: profile?.weight_kg || 60,
    Education: 4,
    Income: 5,
    Smoker: 0,
    HvyAlcoholConsump: 0,
    PhysActivity: 1,
    Fruits: 1,
    Veggies: 1,
    GenHlth: 2,
    PhysHlth: 0,
    MentHlth: 0,
    DiffWalk: 0,
    HighBP: 0,
    HighChol: 0,
    CholCheck: 1,
    Stroke: 0,
    HeartDiseaseorAttack: 0,
    Diabetes_binary: 0,
    AnyHealthcare: 1,
    NoDocbcCost: 0,
    notes: "",
  };
}

/**
 * Tính toán chỉ số BMI và đóng gói Payload gửi sang API FastAPI
 */
export function buildScreeningPayload(values: ScreeningFormValues): LifestyleScreeningPayload {
  const heightM = values.height_cm / 100;
  const bmi = Number((values.weight_kg / (heightM * heightM)).toFixed(1));

  return {
    HighBP: values.HighBP,
    HighChol: values.HighChol,
    CholCheck: values.CholCheck,
    BMI: bmi,
    Smoker: values.Smoker,
    Stroke: values.Stroke,
    HeartDiseaseorAttack: values.HeartDiseaseorAttack,
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
  };
}

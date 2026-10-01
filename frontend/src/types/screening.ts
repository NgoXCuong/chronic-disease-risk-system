/**
 * Định nghĩa Type/Interface cho Hệ thống Sàng lọc & Phân tích Nguy cơ (Screening & AI).
 */

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface LoadedModelMetrics {
  test_roc_auc?: number;
  test_recall?: number;
  recall?: number;
  roc_auc?: number;
  f1?: number;
}

export interface LoadedModel {
  disease: string;
  disease_name_vi: string;
  model_type: string;
  optimal_threshold: number;
  trained_date: string;
  features_count: number;
  features_order: string[];
  metrics: LoadedModelMetrics;
}

export interface RiskFactor {
  feature: string;
  feature_name_vi?: string;
  value: number;
  shap_value?: number;
  impact: string;
}

export interface DiseasePrediction {
  disease: string;
  disease_name_vi?: string;
  risk_score: number;
  risk_percentage: number;
  risk_level: RiskLevel;
  optimal_threshold: number;
  is_above_threshold?: boolean;
  top_risk_factors: RiskFactor[];
  recommendations: string[];
  disclaimer: string;
}

export interface LifestyleScreeningPayload {
  HighBP: number;
  HighChol: number;
  CholCheck: number;
  BMI: number;
  Smoker: number;
  Stroke: number;
  HeartDiseaseorAttack: number;
  PhysActivity: number;
  Fruits: number;
  Veggies: number;
  HvyAlcoholConsump: number;
  AnyHealthcare: number;
  NoDocbcCost: number;
  GenHlth: number;
  MentHlth: number;
  PhysHlth: number;
  DiffWalk: number;
  Sex: number;
  Age: number;
  Education: number;
  Income: number;
}

export interface ClinicalDiabetesPayload {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
}

export type ComprehensiveScreeningResponse = Record<string, DiseasePrediction>;


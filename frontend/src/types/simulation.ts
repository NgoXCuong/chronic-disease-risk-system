import { RiskLevel } from "./screening";

export interface WhatIfDiseaseComparison {
  disease: string;
  disease_name_vi: string;
  baseline_risk_score: number;
  baseline_risk_percentage: number;
  baseline_risk_level: RiskLevel;
  simulated_risk_score: number;
  simulated_risk_percentage: number;
  simulated_risk_level: RiskLevel;
  delta_risk_score: number;
  delta_percentage: number;
  is_improved: boolean;
  clinical_message: string;
}

export interface WhatIfSimulationRequest {
  record_id?: string | null;
  baseline_input?: Record<string, any> | null;
  modified_features: Record<string, any>;
}

export interface WhatIfSimulationResponse {
  record_id?: string | null;
  baseline_features: Record<string, any>;
  simulated_features: Record<string, any>;
  comparisons: WhatIfDiseaseComparison[];
  average_risk_reduction: number;
  overall_clinical_summary: string;
  simulation_id?: string | null;
}

import client from "./client";
import { WhatIfSimulationRequest, WhatIfSimulationResponse } from "@/types/simulation";

/**
 * Module API Mô phỏng Can thiệp Lối sống What-If (Sprint 15)
 */
export const simulationApi = {
  /**
   * Tính toán mô phỏng giả định đối chứng Before vs. After theo thời gian thực
   */
  async calculateSimulation(payload: WhatIfSimulationRequest): Promise<WhatIfSimulationResponse> {
    const res = await client.post<WhatIfSimulationResponse>("/simulation/calculate", payload);
    return res.data;
  },
};

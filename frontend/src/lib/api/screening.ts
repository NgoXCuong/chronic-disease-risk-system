import client from "./client";
import {
  LoadedModel,
  LifestyleScreeningPayload,
  ClinicalDiabetesPayload,
  ComprehensiveScreeningResponse,
  ScreeningHistoryResponse,
  RiskTrajectoryResponse,
} from "@/types/screening";

// Bộ đệm RAM (In-Memory Cache) và chống gọi trùng lặp (Request Deduplication) cho danh sách mô hình AI
let cachedModels: LoadedModel[] | null = null;
let modelsPromise: Promise<LoadedModel[]> | null = null;

/**
 * Module API Sàng lọc & Suy luận Trí tuệ Nhân tạo (Screening & AI Inference)
 */
export const screeningApi = {
  /**
   * Lấy danh sách 5 mô hình AI trong RAM backend kèm cơ chế In-Memory Cache và Request Deduplication
   */
  async getModels(): Promise<LoadedModel[]> {
    if (cachedModels) return cachedModels;
    if (modelsPromise) return modelsPromise;

    modelsPromise = client
      .get<LoadedModel[]>("/screening/models")
      .then((res: { data: LoadedModel[] }) => {
        cachedModels = res.data;
        modelsPromise = null;
        return res.data;
      })
      .catch((err: unknown) => {
        modelsPromise = null;
        throw err;
      });

    return modelsPromise;
  },

  /**
   * Sàng lọc toàn diện 4 bệnh mạn tính Tầng 1 (CDC BRFSS)
   */
  async predictComprehensive(
    payload: LifestyleScreeningPayload
  ): Promise<ComprehensiveScreeningResponse> {
    const res = await client.post<ComprehensiveScreeningResponse>(
      "/screening/comprehensive",
      payload
    );
    return res.data;
  },

  /**
   * Sàng lọc chuyên sâu Đái tháo đường Tầng 2 theo kết quả xét nghiệm máu (Pima Clinical)
   */
  async predictClinicalDiabetes(payload: ClinicalDiabetesPayload): Promise<any> {
    const res = await client.post("/screening/predict/clinical/diabetes", payload);
    return res.data;
  },

  /**
   * Lấy danh sách lịch sử sàng lọc phân trang
   */
  async getHistory(page = 1, pageSize = 5): Promise<ScreeningHistoryResponse> {
    const res = await client.get<ScreeningHistoryResponse>(
      `/screening/history?page=${page}&page_size=${pageSize}`
    );
    return res.data;
  },

  /**
   * Lấy chi tiết một đợt sàng lọc kèm giá trị TreeSHAP và khuyến nghị lâm sàng
   */
  async getHistoryById(recordId: string): Promise<any> {
    const res = await client.get(`/screening/history/${recordId}`);
    return res.data;
  },

  /**
   * Lấy chuỗi thời gian diễn tiến nguy cơ của một bệnh lý
   */
  async getTrajectory(diseaseName: string): Promise<RiskTrajectoryResponse> {
    const res = await client.get<RiskTrajectoryResponse>(
      `/screening/trajectory/${diseaseName}`
    );
    return res.data;
  },
};

export default screeningApi;

import { apiClient } from "./client";
import {
  FacilitySpecialty,
  MedicalFacility,
  NearbyFacilitiesResponse,
} from "@/types/facility";

export interface NearbyFacilitiesParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  specialty?: FacilitySpecialty;
  city?: string;
  limit?: number;
}

/**
 * Gọi API lấy danh sách cơ sở y tế lân cận theo tọa độ GPS và bán kính (FR-23, FR-24).
 */
export async function getNearbyFacilities(
  params: NearbyFacilitiesParams
): Promise<NearbyFacilitiesResponse> {
  const { data } = await apiClient.get<NearbyFacilitiesResponse>("/facilities/nearby", {
    params: {
      latitude: params.latitude,
      longitude: params.longitude,
      radius_km: params.radius_km ?? 15.0,
      specialty: params.specialty || undefined,
      city: params.city || undefined,
      limit: params.limit ?? 20,
    },
  });
  return data;
}

/**
 * Gợi ý bệnh viện chuyên khoa tương ứng với bệnh mạn tính nguy cơ cao (FR-25).
 */
export async function getRecommendedFacilitiesForDisease(
  disease: string,
  latitude: number,
  longitude: number,
  radiusKm = 25.0,
  limit = 10
): Promise<NearbyFacilitiesResponse> {
  const { data } = await apiClient.get<NearbyFacilitiesResponse>(
    `/facilities/recommended-for-disease/${disease}`,
    {
      params: {
        latitude,
        longitude,
        radius_km: radiusKm,
        limit,
      },
    }
  );
  return data;
}

/**
 * Lấy danh sách các tỉnh thành phố có cơ sở y tế.
 */
export async function getAvailableCities(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>("/facilities/cities");
  return data;
}

/**
 * Lấy thông tin chi tiết một cơ sở y tế theo ID.
 */
export async function getFacilityDetail(facilityId: string): Promise<MedicalFacility> {
  const { data } = await apiClient.get<MedicalFacility>(`/facilities/${facilityId}`);
  return data;
}

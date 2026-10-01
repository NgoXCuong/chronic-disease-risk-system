/**
 * Kiểu dữ liệu cho Module Bản đồ & Cơ sở Y tế Chuyên khoa (Sprint 17: FR-23 -> FR-25).
 * Tuân thủ quy chuẩn TypeScript strict và hợp đồng dữ liệu với Backend FastAPI.
 */

export type FacilitySpecialty =
  | "ENDOCRINOLOGY"       // Nội tiết & Đái tháo đường
  | "CARDIOLOGY"           // Tim mạch & Tăng huyết áp
  | "STROKE_NEUROLOGY"     // Đột quỵ & Thần kinh mạch máu
  | "GENERAL_HOSPITAL";    // Bệnh viện Đa khoa tuyến cuối

export type FacilityTier =
  | "CENTRAL"              // Tuyến Trung ương
  | "PROVINCIAL"           // Tuyến Tỉnh / Thành phố
  | "DISTRICT"             // Tuyến Huyện / Quận
  | "PRIVATE";             // Bệnh viện Tư nhân

export interface MedicalFacility {
  id: string;
  name: string;
  specialty: FacilitySpecialty;
  facility_tier: FacilityTier;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  emergency_phone: string | null;
  website: string | null;
  opening_hours: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NearbyFacilityItem extends MedicalFacility {
  distance_km: number;
  google_maps_url: string;
}

export interface NearbyFacilitiesResponse {
  user_latitude: number;
  user_longitude: number;
  radius_km: number;
  total_found: number;
  specialty_filter: FacilitySpecialty | null;
  facilities: NearbyFacilityItem[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  label?: string;
}

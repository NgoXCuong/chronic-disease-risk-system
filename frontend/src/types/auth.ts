/**
 * Định nghĩa Type/Interface cho Hệ thống Xác thực & Người dùng (Authentication & User).
 * Tuân thủ chuẩn mực Pydantic schemas của Backend FastAPI.
 */

export type UserRole = "USER" | "DOCTOR" | "ADMIN";
export type BiologicalSex = "male" | "female" | "other";

export interface PatientProfile {
  id?: string;
  user_id?: string;
  full_name?: string | null;
  date_of_birth?: string | null;
  gender?: BiologicalSex | string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  profile?: PatientProfile | null;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: BiologicalSex | string;
  height_cm?: number;
  weight_kg?: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface MessageResponse {
  message: string;
  success?: boolean;
}

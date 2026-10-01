/**
 * Kiểu dữ liệu xác thực người dùng (Auth Types)
 * Đồng bộ 100% với Pydantic schemas của FastAPI Backend
 */

export type BiologicalSex = "MALE" | "FEMALE" | "OTHER";

export type UserRole = "USER" | "HEALTH_CONSULTANT" | "ADMIN";

export interface PatientProfile {
  id: string;
  user_id: string;
  full_name?: string | null;
  date_of_birth?: string | null;
  gender?: BiologicalSex | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
  medical_history?: Record<string, unknown> | null;
  emergency_contact?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
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

export interface UserRegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: BiologicalSex;
  height_cm?: number;
  weight_kg?: number;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserLoginRequest) => Promise<void>;
  register: (payload: UserRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

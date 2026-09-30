import client from "./client";
import { PatientProfile } from "@/types/auth";

export interface UpdateProfileRequest {
  full_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
}

/**
 * Module API Quản lý Hồ sơ Bệnh nhân & Chỉ số Nhân trắc (User Profile & Vitals)
 */
export const usersApi = {
  /**
   * Lấy thông tin hồ sơ cá nhân và chỉ số nhân trắc học
   */
  async getProfile(): Promise<PatientProfile> {
    const res = await client.get<PatientProfile>("/users/profile");
    return res.data;
  },

  /**
   * Cập nhật thông tin hồ sơ và chỉ số thể trạng (chiều cao, cân nặng, BMI)
   */
  async updateProfile(data: UpdateProfileRequest): Promise<PatientProfile> {
    const res = await client.put<PatientProfile>("/users/profile", data);
    return res.data;
  },
};

export default usersApi;

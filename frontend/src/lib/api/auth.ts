import { apiClient } from "@/lib/api/client";
import {
  MessageResponse,
  PasswordChangeRequest,
  TokenResponse,
  User,
  UserLoginRequest,
  UserRegisterRequest,
} from "@/types/auth";

/**
 * Service API Xác thực & Tài khoản (Authentication)
 * Tương ứng Router /api/v1/auth của FastAPI Backend
 */
export const authApi = {
  /**
   * Đăng nhập với email và mật khẩu
   * Backend tự động set HttpOnly Cookie
   */
  async login(payload: UserLoginRequest): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>("/auth/login", payload);
    return res.data;
  },

  /**
   * Đăng ký tài khoản người dùng mới
   */
  async register(payload: UserRegisterRequest): Promise<User> {
    const res = await apiClient.post<User>("/auth/register", payload);
    return res.data;
  },

  /**
   * Đăng xuất khỏi hệ thống
   * Thu hồi phiên làm việc và xóa cookie
   */
  async logout(): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>("/auth/logout");
    return res.data;
  },

  /**
   * Lấy thông tin tài khoản người dùng và hồ sơ sức khỏe hiện tại
   */
  async getMe(): Promise<User> {
    const res = await apiClient.get<User>("/auth/me");
    return res.data;
  },

  /**
   * Đổi mật khẩu tài khoản
   */
  async changePassword(payload: PasswordChangeRequest): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>("/auth/change-password", payload);
    return res.data;
  },

  /**
   * Cấp mới Access Token thủ công qua Refresh Token Rotation
   */
  async refreshToken(): Promise<TokenResponse> {
    const res = await apiClient.post<TokenResponse>("/auth/refresh");
    return res.data;
  },
};

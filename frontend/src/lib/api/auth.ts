import client from "./client";
import {
  TokenResponse,
  User,
  UserLoginRequest,
  UserRegisterRequest,
  MessageResponse,
} from "@/types/auth";

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

/**
 * Module API Xác thực & Phiên làm việc y tế (Authentication & Session)
 */
export const authApi = {
  /**
   * Đăng nhập: Gửi thông tin đăng nhập, backend tự động thiết lập HttpOnly Cookies
   */
  async login(credentials: UserLoginRequest): Promise<TokenResponse> {
    const res = await client.post<TokenResponse>("/auth/login", credentials);
    return res.data;
  },

  /**
   * Đăng ký: Tạo tài khoản bệnh nhân và hồ sơ nhân trắc ban đầu
   */
  async register(data: UserRegisterRequest): Promise<void> {
    await client.post("/auth/register", data);
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ phiên HttpOnly Cookie
   */
  async getMe(): Promise<User> {
    const res = await client.get<User>("/auth/me");
    return res.data;
  },

  /**
   * Đăng xuất: Thu hồi refresh token và xoá sạch HttpOnly Cookies trên trình duyệt
   */
  async logout(): Promise<void> {
    await client.post("/auth/logout");
  },

  /**
   * Đổi mật khẩu tài khoản
   */
  async changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
    const res = await client.post<MessageResponse>("/auth/change-password", data);
    return res.data;
  },
};

export default authApi;

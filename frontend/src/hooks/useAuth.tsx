"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  TokenResponse,
  User,
  UserLoginRequest,
  UserRegisterRequest,
} from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserLoginRequest) => Promise<void>;
  register: (data: UserRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  // Nạp thông tin người dùng từ phiên làm việc HttpOnly Cookie
  const fetchCurrentUser = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<User>("/auth/me");
      setUser(res.data);
      setError(null);
    } catch (err: any) {
      // Nếu chưa có phiên đăng nhập hoặc cookie hết hạn
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Đăng nhập: Máy chủ tự động gắn HttpOnly cookies an toàn chống XSS
  const login = async (credentials: UserLoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post<TokenResponse>("/auth/login", credentials);

      // Lấy thông tin user ngay sau khi cookie được trình duyệt thiết lập
      const userRes = await api.get<User>("/auth/me");
      setUser(userRes.data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng ký tài khoản mới và tự động đăng nhập
  const register = async (data: UserRegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post("/auth/register", data);

      // Tự động đăng nhập ngay sau khi đăng ký thành công
      await login({ email: data.email, password: data.password });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        "Đăng ký không thành công. Email có thể đã được sử dụng.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng xuất: Yêu cầu server thu hồi refresh token và xóa sạch HttpOnly cookies
  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Lỗi khi gọi API đăng xuất:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshProfile: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth bắt buộc phải được sử dụng bên trong <AuthProvider>"
    );
  }
  return context;
}

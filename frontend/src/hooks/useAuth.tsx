"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { AuthContextType, User, UserLoginRequest, UserRegisterRequest } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Khôi phục phiên làm việc từ HttpOnly Cookie khi tải trang
  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Xử lý Đăng nhập
  const login = async (credentials: UserLoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.login(credentials);
      const userData = await authApi.getMe();
      setUser(userData);
      toast.success("Đăng nhập thành công!", {
        description: `Chào mừng trở lại, ${userData.profile?.full_name || userData.email}.`,
      });
      router.push("/dashboard");
    } catch (error) {
      const errorMsg = getApiErrorMessage(error);
      toast.error("Đăng nhập thất bại", { description: errorMsg });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Đăng ký tài khoản mới
  const register = async (payload: UserRegisterRequest): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.register(payload);
      toast.success("Đăng ký tài khoản thành công!", {
        description: "Hồ sơ y tế của bạn đã được khởi tạo. Vui lòng đăng nhập.",
      });
      router.push("/login");
    } catch (error) {
      const errorMsg = getApiErrorMessage(error);
      toast.error("Đăng ký thất bại", { description: errorMsg });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý Đăng xuất
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Dù API lỗi vẫn xóa state client để đảm bảo an toàn
    } finally {
      setUser(null);
      setIsLoading(false);
      toast.info("Đã đăng xuất", {
        description: "Phiên làm việc đã kết thúc an toàn.",
      });
      router.push("/login");
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
}

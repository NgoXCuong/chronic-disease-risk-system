"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      await login(data);
    } catch {
      // Thông báo lỗi đã được xử lý tập trung trong useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Ô nhập Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Địa chỉ Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="bacsi@benhvien.vn hoặc email@domain.com"
            className="pl-10 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-500 font-medium mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Ô nhập Mật khẩu */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mật khẩu
          </Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-10 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500"
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-500 font-medium mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Nút bấm Đăng nhập */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all shadow-md shadow-teal-600/20 mt-2"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang xác thực...
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Đăng nhập vào Hệ thống
          </span>
        )}
      </Button>

      {/* Chuyển hướng Đăng ký */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Chưa có tài khoản sức khỏe?{" "}
          <Link
            href="/register"
            className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline underline-offset-4"
          >
            Đăng ký hồ sơ mới
          </Link>
        </p>
      </div>
    </form>
  );
}

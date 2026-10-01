"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { RegisterAccountSection } from "@/components/forms/RegisterAccountSection";
import { RegisterVitalsSection } from "@/components/forms/RegisterVitalsSection";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      full_name: "",
      height_cm: undefined,
      weight_kg: undefined,
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name || undefined,
        gender: data.gender,
        height_cm: data.height_cm || undefined,
        weight_kg: data.weight_kg || undefined,
      });
    } catch {
      // Lỗi đã được toast trong useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Khối biểu mẫu 2 cột trên máy tính / tablet, 1 cột trên mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Cột 1: Thông tin tài khoản */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold">
              1
            </span>
            <h2 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              Thông tin Tài khoản
            </h2>
          </div>
          <RegisterAccountSection
            register={register}
            errors={errors}
            passwordValue={passwordValue}
          />
        </div>

        {/* Cột 2: Chỉ số thể chất ban đầu */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold">
                2
              </span>
              <h2 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                Hồ sơ Thể chất Ban đầu
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              Tùy chọn
            </span>
          </div>
          <RegisterVitalsSection
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
        </div>
      </div>

      {/* Nút bấm Đăng ký & Chuyển hướng */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all shadow-md shadow-teal-600/20"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang khởi tạo tài khoản y tế...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Hoàn tất Đăng ký Hồ sơ
            </span>
          )}
        </Button>

        {/* Chuyển hướng Đăng nhập */}
        <div className="text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Đã có tài khoản sức khỏe?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline underline-offset-4"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}

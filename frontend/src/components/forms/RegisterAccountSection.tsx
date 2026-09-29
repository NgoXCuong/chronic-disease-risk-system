"use client";

import * as React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { PasswordStrengthBar } from "@/components/common/PasswordStrengthBar";

interface RegisterAccountSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  passwordValue?: string;
}

export function RegisterAccountSection({
  register,
  errors,
  passwordValue = "",
}: RegisterAccountSectionProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <div className="space-y-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-medical-600" />
        1. Thông tin tài khoản y tế
      </h3>

      <MedicalInputField
        id="email"
        type="email"
        label="Địa chỉ Email đăng ký"
        required
        icon={Mail}
        placeholder="nguyenvana@gmail.com"
        error={errors.email?.message as string}
        {...register("email")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Trường Mật khẩu tài khoản */}
        <MedicalInputField
          id="password"
          type={showPassword ? "text" : "password"}
          label="Mật khẩu"
          required
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message as string}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register("password")}
        />

        {/* Trường Xác nhận mật khẩu - Có đầy đủ icon mắt */}
        <MedicalInputField
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Xác nhận mật khẩu"
          required
          icon={Lock}
          placeholder="••••••••"
          error={errors.confirmPassword?.message as string}
          rightAction={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register("confirmPassword")}
        />
      </div>

      {/* Thanh đo tiến độ độ mạnh mật khẩu y tế */}
      <PasswordStrengthBar password={passwordValue} />
    </div>
  );
}

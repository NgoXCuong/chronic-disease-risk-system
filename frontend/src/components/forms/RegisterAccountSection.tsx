"use client";

import * as React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { PasswordChecklist } from "@/components/common/PasswordChecklist";

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

  return (
    <div className="space-y-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-medical-600" />
        1. Thông tin đăng nhập
      </h3>

      <MedicalInputField
        id="email"
        type="email"
        label="Địa chỉ Email"
        required
        icon={Mail}
        placeholder="benhnhan@example.com"
        error={errors.email?.message as string}
        {...register("email")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register("password")}
        />

        <MedicalInputField
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          label="Xác nhận mật khẩu"
          required
          icon={Lock}
          placeholder="••••••••"
          error={errors.confirmPassword?.message as string}
          {...register("confirmPassword")}
        />
      </div>

      <PasswordChecklist password={passwordValue} />
    </div>
  );
}

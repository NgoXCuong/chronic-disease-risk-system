import React, { useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RegisterFormData } from "@/lib/validations/auth";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

interface Props {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  passwordValue?: string;
}

export function RegisterAccountSection({ register, errors, passwordValue }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Địa chỉ Email <span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="nguoidung@email.com"
            className="pl-10 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Mật khẩu */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Mật khẩu an toàn <span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự, có hoa, thường, số"
            className="pl-10 pr-10 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800"
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
        <PasswordStrengthIndicator password={passwordValue} />
        {errors.password && (
          <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
        )}
      </div>

      {/* Nhập lại mật khẩu */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-confirm" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Xác nhận Mật khẩu <span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="reg-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Nhập lại chính xác mật khẩu"
            className="pl-10 pr-10 h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800"
            {...register("confirmPassword")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-rose-500 font-medium">{errors.confirmPassword.message}</p>
        )}
      </div>
    </div>
  );
}

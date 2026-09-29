"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { AuthBrandingPanel } from "@/components/auth/AuthBrandingPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập địa chỉ email.").email("Định dạng email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu tài khoản."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const sessionExpired = searchParams.get("session_expired") === "true";

  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setApiError(null);
      await login(values);
      router.push(callbackUrl);
    } catch (err: any) {
      setApiError(err.message || "Email hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="w-full max-w-md my-auto">
      <AuthMobileHeader />

      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Đăng nhập Hệ thống Y tế
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Truy cập hồ sơ cá nhân, lịch sử sàng lọc và nhận khuyến nghị sức khỏe chuyên sâu
        </p>
      </div>

      {sessionExpired && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.</AlertDescription>
        </Alert>
      )}
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <MedicalInputField
          id="email"
          type="email"
          label="Địa chỉ Email"
          required
          icon={Mail}
          placeholder="nguyenvana@gmail.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <MedicalInputField
          id="password"
          type={showPassword ? "text" : "password"}
          label="Mật khẩu"
          required
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-base font-semibold shadow-md gap-2 mt-2"
        >
          {isSubmitting ? "Đang xác thực..." : <>Đăng nhập Hồ sơ <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <p>
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-medical-600 dark:text-medical-400 hover:underline">
            Đăng ký Hồ sơ Sức khỏe mới
          </Link>
        </p>
        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-medical-600" />
          Thông tin đăng nhập và hồ sơ bệnh nhân được mã hóa bảo mật đa tầng
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Cột trái: Thương hiệu, Tầm nhìn Y tế & Đóng góp CDSS */}
      <AuthBrandingPanel />

      {/* Cột phải: Form Đăng nhập */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-8 sm:py-12 bg-white dark:bg-slate-950 overflow-y-auto">
        <React.Suspense
          fallback={
            <div className="w-full max-w-md space-y-4">
              <Skeleton className="h-10 w-48 rounded-lg" />
              <Skeleton className="h-44 w-full rounded-2xl" />
            </div>
          }
        >
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}

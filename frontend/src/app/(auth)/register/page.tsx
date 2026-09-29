"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthBrandingPanel } from "@/components/auth/AuthBrandingPanel";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { RegisterAccountSection } from "@/components/forms/RegisterAccountSection";
import { RegisterVitalsSection } from "@/components/forms/RegisterVitalsSection";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z
  .object({
    email: z.string().min(1, "Vui lòng nhập địa chỉ email.").email("Định dạng email không hợp lệ."),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự.")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa.")
      .regex(/[a-z]/, "Cần ít nhất 1 chữ thường.")
      .regex(/\d/, "Cần ít nhất 1 chữ số."),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
    full_name: z.string().max(150).optional(),
    date_of_birth: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    height_cm: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().min(40).max(250).optional()),
    weight_kg: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().min(15).max(300).optional()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const watchedPassword = useWatch({ control, name: "password" }) || "";
  const watchedHeight = useWatch({ control, name: "height_cm" });
  const watchedWeight = useWatch({ control, name: "weight_kg" });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setApiError(null);
      await registerAuth({
        email: values.email,
        password: values.password,
        full_name: values.full_name || undefined,
        date_of_birth: values.date_of_birth || undefined,
        gender: values.gender,
        height_cm: values.height_cm ? Number(values.height_cm) : undefined,
        weight_kg: values.weight_kg ? Number(values.weight_kg) : undefined,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setApiError(err.message || "Đăng ký không thành công. Email có thể đã tồn tại.");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Cột trái: Thương hiệu Y tế & Tầm nhìn CDSS */}
      <AuthBrandingPanel />

      {/* Cột phải: Form Đăng ký */}
      <div className="flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-8 sm:py-12 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-lg my-auto">
          <AuthMobileHeader />

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Đăng ký tài khoản
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Khởi tạo hồ sơ sức khỏe cá nhân và thể trạng để phân tích nguy cơ AI
            </p>
          </div>

          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <RegisterAccountSection register={register} errors={errors} passwordValue={watchedPassword} />
            <RegisterVitalsSection register={register} errors={errors} heightValue={watchedHeight} weightValue={watchedWeight} />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-base font-semibold shadow-md gap-2"
            >
              {isSubmitting ? "Đang tạo tài khoản..." : <>Hoàn tất Đăng ký <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p>
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-bold text-medical-600 dark:text-medical-400 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-medical-600" />
              Tự động kích hoạt phiên làm việc HttpOnly an toàn
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

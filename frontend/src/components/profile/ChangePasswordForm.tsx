"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, CheckCircle2, KeyRound, Lock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { api } from "@/lib/api";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại."),
    new_password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự.")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa.")
      .regex(/[a-z]/, "Cần ít nhất 1 chữ thường.")
      .regex(/\d/, "Cần ít nhất 1 chữ số."),
    confirm_new_password: z.string().min(1, "Vui lòng xác nhận mật khẩu mới."),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirm_new_password"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      setError(null);
      setSuccess(null);
      await api.post("/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      setSuccess("Đổi mật khẩu thành công! Vui lòng đăng nhập lại khi hết phiên.");
      reset();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.");
    }
  };

  return (
    <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-medical-600" />
          Đổi mật khẩu
        </CardTitle>
        <CardDescription>Bảo vệ an toàn cho hồ sơ sức khỏe và dữ liệu y tế</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert variant="success"><CheckCircle2 className="w-4 h-4" /><AlertDescription>{success}</AlertDescription></Alert>
        )}
        {error && (
          <Alert variant="destructive"><AlertCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <MedicalInputField id="current_password" type="password" label="Mật khẩu hiện tại" required icon={Lock} placeholder="••••••••" error={errors.current_password?.message} {...register("current_password")} />
          <MedicalInputField id="new_password" type="password" label="Mật khẩu mới" required icon={Lock} placeholder="Tối thiểu 8 ký tự, có hoa, thường, số" error={errors.new_password?.message} {...register("new_password")} />
          <MedicalInputField id="confirm_new_password" type="password" label="Xác nhận mật khẩu mới" required icon={Lock} placeholder="••••••••" error={errors.confirm_new_password?.message} {...register("confirm_new_password")} />

          <Button type="submit" variant="outline" disabled={isSubmitting} className="w-full gap-2">
            <Lock className="w-4 h-4" />
            {isSubmitting ? "Đang đổi mật khẩu..." : "Lưu mật khẩu mới"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

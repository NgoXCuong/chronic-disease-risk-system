"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Calendar, CheckCircle2, Heart, Ruler, Save, User as UserIcon, Weight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { BMICalculatorCard } from "@/components/common/BMICalculatorCard";
import { api } from "@/lib/api";

const vitalsSchema = z.object({
  full_name: z.string().max(150).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  height_cm: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().min(40).max(250).optional()),
  weight_kg: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().min(15).max(300).optional()),
});

type VitalsFormValues = z.infer<typeof vitalsSchema>;

interface ProfileVitalsFormProps {
  initialData?: Partial<VitalsFormValues>;
  onSuccess?: () => void;
}

export function ProfileVitalsForm({ initialData, onSuccess }: ProfileVitalsFormProps) {
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: initialData,
  });

  React.useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  const watchedHeight = useWatch({ control, name: "height_cm" });
  const watchedWeight = useWatch({ control, name: "weight_kg" });

  const onSubmit = async (values: VitalsFormValues) => {
    try {
      setError(null);
      setSuccess(null);
      await api.put("/users/profile", {
        full_name: values.full_name || null,
        date_of_birth: values.date_of_birth || null,
        gender: values.gender || null,
        height_cm: values.height_cm ? Number(values.height_cm) : null,
        weight_kg: values.weight_kg ? Number(values.weight_kg) : null,
      });
      setSuccess("Cập nhật hồ sơ sức khỏe thành công!");
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Không thể cập nhật hồ sơ.");
    }
  };

  return (
    <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Heart className="w-5 h-5 text-medical-600" />
          Chỉ số Thể trạng &amp; Nhân trắc
        </CardTitle>
        <CardDescription>Chiều cao và cân nặng sẽ tự động cập nhật chỉ số BMI đánh giá rủi ro</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert variant="success"><CheckCircle2 className="w-4 h-4" /><AlertDescription>{success}</AlertDescription></Alert>
        )}
        {error && (
          <Alert variant="destructive"><AlertCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <MedicalInputField id="full_name" label="Họ và tên" icon={UserIcon} placeholder="Họ và tên bệnh nhân" error={errors.full_name?.message} {...register("full_name")} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MedicalInputField id="date_of_birth" type="date" label="Ngày sinh" icon={Calendar} error={errors.date_of_birth?.message} {...register("date_of_birth")} />
            <div className="space-y-1.5">
              <Label htmlFor="gender">Giới tính sinh học</Label>
              <Select id="gender" {...register("gender")}>
                <option value="">Chưa chọn</option>
                <option value="MALE">Nam (Male)</option>
                <option value="FEMALE">Nữ (Female)</option>
                <option value="OTHER">Khác (Other)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MedicalInputField id="height_cm" type="number" step="0.5" label="Chiều cao (cm)" icon={Ruler} placeholder="Ví dụ: 170" error={errors.height_cm?.message} {...register("height_cm")} />
            <MedicalInputField id="weight_kg" type="number" step="0.5" label="Cân nặng (kg)" icon={Weight} placeholder="Ví dụ: 65" error={errors.weight_kg?.message} {...register("weight_kg")} />
          </div>

          {watchedHeight && watchedWeight && Number(watchedHeight) > 0 && Number(watchedWeight) > 0 && (
            <BMICalculatorCard heightCm={Number(watchedHeight)} weightKg={Number(watchedWeight)} className="mt-2" />
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Đang lưu..." : "Cập nhật hồ sơ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, CheckCircle2, Heart, Ruler, Save, User as UserIcon, Weight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicalInputField } from "@/components/common/MedicalInputField";
import { MedicalDatePicker } from "@/components/common/MedicalDatePicker";
import { NumberStepperInput } from "@/components/common/NumberStepperInput";
import { BMICalculatorCard } from "@/components/common/BMICalculatorCard";
import { usersApi } from "@/lib/api/users";

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
      await usersApi.updateProfile({
        full_name: values.full_name || null,
        date_of_birth: values.date_of_birth || null,
        gender: values.gender || null,
        height_cm: values.height_cm ? Number(values.height_cm) : null,
        weight_kg: values.weight_kg ? Number(values.weight_kg) : null,
      });
      setSuccess("Cập nhật thông tin thể trạng và hồ sơ y tế thành công.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Heart className="w-5 h-5 text-medical-600" />
          Chỉ số Thể trạng &amp; Nhân trắc
        </CardTitle>
        <CardDescription>
          Chiều cao và cân nặng sẽ tự động cập nhật chỉ số BMI chuẩn WPRO đánh giá rủi ro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert variant="success">
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <MedicalInputField
            id="full_name"
            label="Họ và tên bệnh nhân"
            icon={UserIcon}
            placeholder="Ví dụ: Nguyễn Văn A"
            error={errors.full_name?.message}
            {...register("full_name")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="date_of_birth"
              control={control}
              render={({ field }) => (
                <MedicalDatePicker
                  id="date_of_birth"
                  label="Ngày sinh"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date_of_birth?.message}
                />
              )}
            />

            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Giới tính sinh học
                  </Label>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Chọn giới tính sinh học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam giới</SelectItem>
                      <SelectItem value="FEMALE">Nữ giới</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender?.message && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      {String(errors.gender.message)}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="height_cm"
              control={control}
              render={({ field }) => (
                <NumberStepperInput
                  id="height_cm"
                  label="Chiều cao"
                  unit="cm"
                  min={40}
                  max={250}
                  step={0.5}
                  icon={Ruler}
                  placeholder="170"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.height_cm?.message}
                />
              )}
            />

            <Controller
              name="weight_kg"
              control={control}
              render={({ field }) => (
                <NumberStepperInput
                  id="weight_kg"
                  label="Cân nặng"
                  unit="kg"
                  min={15}
                  max={300}
                  step={0.5}
                  icon={Weight}
                  placeholder="65"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.weight_kg?.message}
                />
              )}
            />
          </div>

          {watchedHeight && watchedWeight && Number(watchedHeight) > 0 && Number(watchedWeight) > 0 && (
            <BMICalculatorCard heightCm={Number(watchedHeight)} weightKg={Number(watchedWeight)} className="mt-2" />
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Đang lưu..." : "Cập nhật hồ sơ y tế"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

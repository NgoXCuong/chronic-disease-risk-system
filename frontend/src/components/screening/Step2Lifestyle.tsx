import React from "react";
import { UseFormSetValue, UseFormWatch, UseFormRegister } from "react-hook-form";
import {
  Cigarette,
  Beer,
  Dumbbell,
  Apple,
  Salad,
  Footprints,
  HeartHandshake,
  CalendarDays,
  Plus,
  Minus,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScreeningFormValues } from "@/lib/validations/screening";
import { GEN_HEALTH_OPTIONS } from "@/lib/screening-constants";

interface Props {
  register: UseFormRegister<ScreeningFormValues>;
  setValue: UseFormSetValue<ScreeningFormValues>;
  watch: UseFormWatch<ScreeningFormValues>;
}

export function Step2Lifestyle({ register, setValue, watch }: Props) {
  const smoker = watch("Smoker");
  const alcohol = watch("HvyAlcoholConsump");
  const physActivity = watch("PhysActivity");
  const fruits = watch("Fruits");
  const veggies = watch("Veggies");
  const diffWalk = watch("DiffWalk");
  const genHlth = watch("GenHlth");
  const physHlth = watch("PhysHlth") || 0;
  const mentHlth = watch("MentHlth") || 0;

  const binaryQuestions = [
    {
      key: "Smoker" as const,
      value: smoker,
      title: "Hút thuốc lá",
      desc: "Bạn đã từng hút ít nhất 100 điếu thuốc trong suốt cuộc đời?",
      icon: Cigarette,
    },
    {
      key: "HvyAlcoholConsump" as const,
      value: alcohol,
      title: "Uống nhiều bia rượu",
      desc: "Uống > 14 ly/tuần (đối với nam) hoặc > 7 ly/tuần (đối với nữ)?",
      icon: Beer,
    },
    {
      key: "PhysActivity" as const,
      value: physActivity,
      title: "Hoạt động thể lực",
      desc: "Có tập thể dục, thể thao hoặc vận động thể chất ngoài giờ làm việc trong 30 ngày qua?",
      icon: Dumbbell,
    },
    {
      key: "Fruits" as const,
      value: fruits,
      title: "Tiêu thụ trái cây",
      desc: "Ăn hoa quả tươi ít nhất 1 lần mỗi ngày?",
      icon: Apple,
    },
    {
      key: "Veggies" as const,
      value: veggies,
      title: "Tiêu thụ rau xanh",
      desc: "Ăn rau củ quả ít nhất 1 lần mỗi ngày trong các bữa ăn?",
      icon: Salad,
    },
    {
      key: "DiffWalk" as const,
      value: diffWalk,
      title: "Hạn chế vận động",
      desc: "Gặp khó khăn nghiêm trọng khi đi bộ hoặc leo trèo cầu thang?",
      icon: Footprints,
    },
  ];

  const adjustDays = (field: "PhysHlth" | "MentHlth", delta: number) => {
    const current = Number(watch(field)) || 0;
    const next = Math.max(0, Math.min(30, current + delta));
    setValue(field, next, { shouldValidate: true });
  };

  const clampDays = (field: "PhysHlth" | "MentHlth") => {
    const current = Number(watch(field));
    if (isNaN(current) || current < 0) {
      setValue(field, 0, { shouldValidate: true });
    } else if (current > 30) {
      setValue(field, 30, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Khối 1: Danh sách câu hỏi lối sống dạng Card tương tác */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Thói quen Sinh hoạt Thường nhật
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {binaryQuestions.map((q) => (
            <div
              key={q.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mt-0.5">
                  <q.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {q.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                    {q.desc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  type="button"
                  variant={q.value === 1 ? "default" : "outline"}
                  onClick={() => setValue(q.key, 1, { shouldValidate: true })}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold ${
                    q.value === 1
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Có
                </Button>
                <Button
                  type="button"
                  variant={q.value === 0 ? "default" : "outline"}
                  onClick={() => setValue(q.key, 0, { shouldValidate: true })}
                  className={`h-9 px-4 rounded-xl text-xs font-semibold ${
                    q.value === 0
                      ? "bg-slate-700 hover:bg-slate-800 text-white dark:bg-slate-700"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Không
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Khối 2: Tình trạng Sức khỏe Tự Đánh giá */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Tình trạng Sức khỏe Cảm nhận
        </h3>

        {/* Đánh giá tổng quát */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <HeartHandshake className="h-4 w-4 text-teal-600" />
            Đánh giá sức khỏe tổng quát bản thân
          </Label>
          <Select
            value={String(genHlth || 2)}
            onValueChange={(val) => setValue("GenHlth", Number(val))}
          >
            <SelectTrigger className="h-11 min-h-[44px] rounded-xl border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Chọn mức độ sức khỏe" />
            </SelectTrigger>
            <SelectContent>
              {GEN_HEALTH_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label} — <span className="text-[11px] text-slate-400">{opt.desc}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Số ngày ốm đau thể chất & tinh thần trong 30 ngày qua */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Đau ốm thể chất */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="PhysHlth" className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <CalendarDays className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Số ngày đau ốm thể chất
              </Label>
              <span className="text-[11px] font-semibold text-slate-400">
                0 – 30 ngày
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed min-h-[32px]">
              Trong 30 ngày qua, có bao nhiêu ngày bạn bị đau ốm hoặc tổn thương thể chất?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustDays("PhysHlth", -1)}
                disabled={Number(physHlth) <= 0}
                aria-label="Giảm 1 ngày"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:border-slate-800 shrink-0 cursor-pointer disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="relative flex-1">
                <Input
                  id="PhysHlth"
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  className="h-11 min-h-[44px] text-center font-bold text-base rounded-xl border-slate-200 dark:border-slate-800 pr-12 focus-visible:ring-teal-500"
                  {...register("PhysHlth", { valueAsNumber: true })}
                  onBlur={() => clampDays("PhysHlth")}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none select-none">
                  ngày
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustDays("PhysHlth", 1)}
                disabled={Number(physHlth) >= 30}
                aria-label="Tăng 1 ngày"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:border-slate-800 shrink-0 cursor-pointer disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Căng thẳng tinh thần */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="MentHlth" className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <CalendarDays className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Số ngày căng thẳng tinh thần
              </Label>
              <span className="text-[11px] font-semibold text-slate-400">
                0 – 30 ngày
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed min-h-[32px]">
              Trong 30 ngày qua, có bao nhiêu ngày bạn bị stress, lo âu, mất ngủ hoặc kiệt sức?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustDays("MentHlth", -1)}
                disabled={Number(mentHlth) <= 0}
                aria-label="Giảm 1 ngày"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:border-slate-800 shrink-0 cursor-pointer disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="relative flex-1">
                <Input
                  id="MentHlth"
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  className="h-11 min-h-[44px] text-center font-bold text-base rounded-xl border-slate-200 dark:border-slate-800 pr-12 focus-visible:ring-teal-500"
                  {...register("MentHlth", { valueAsNumber: true })}
                  onBlur={() => clampDays("MentHlth")}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none select-none">
                  ngày
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustDays("MentHlth", 1)}
                disabled={Number(mentHlth) >= 30}
                aria-label="Tăng 1 ngày"
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:border-slate-800 shrink-0 cursor-pointer disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

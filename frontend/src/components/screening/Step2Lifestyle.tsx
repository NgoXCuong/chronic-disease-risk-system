import React, { useState } from "react";
import { UseFormSetValue, UseFormWatch, UseFormRegister } from "react-hook-form";
import {
  Cigarette,
  Beer,
  Dumbbell,
  Apple,
  Salad,
  Footprints,
  HeartPulse,
  Brain,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScreeningFormValues } from "@/lib/validations/screening";

interface Props {
  register: UseFormRegister<ScreeningFormValues>;
  setValue: UseFormSetValue<ScreeningFormValues>;
  watch: UseFormWatch<ScreeningFormValues>;
}

export function Step2Lifestyle({ setValue, watch }: Props) {
  const smoker = watch("Smoker");
  const alcohol = watch("HvyAlcoholConsump");
  const physActivity = watch("PhysActivity");
  const fruits = watch("Fruits");
  const veggies = watch("Veggies");
  const diffWalk = watch("DiffWalk");
  const genHlth = watch("GenHlth") || 2;
  const physHlth = watch("PhysHlth") || 0;
  const mentHlth = watch("MentHlth") || 0;

  // Local state lưu vết chính xác mức độ người dùng lựa chọn để hiển thị active cho từng nút
  const [smokingOption, setSmokingOption] = useState<"NONE" | "QUIT" | "DAILY">(
    smoker === 1 ? "DAILY" : "NONE"
  );
  const [alcoholOption, setAlcoholOption] = useState<"NONE" | "MODERATE" | "HEAVY">(
    alcohol === 1 ? "HEAVY" : "NONE"
  );
  const [physOption, setPhysOption] = useState<"SEDENTARY" | "MODERATE" | "ACTIVE">(
    physActivity === 1 ? "ACTIVE" : "SEDENTARY"
  );

  // Thang đo sức khỏe tổng quát 5 mức độ (Likert) trực quan
  const genHealthLevels = [
    { value: 1, label: "Rất tốt", desc: "Thể lực dồi dào, không bệnh vặt", icon: Sparkles, color: "border-teal-500 bg-teal-50/50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300" },
    { value: 2, label: "Tốt", desc: "Khỏe khoắn, sinh hoạt bình thường", icon: Smile, color: "border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
    { value: 3, label: "Khá", desc: "Thỉnh thoảng mệt, tạm ổn", icon: Meh, color: "border-amber-500 bg-amber-50/50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
    { value: 4, label: "Kém", desc: "Hay mệt mỏi, uể oải", icon: Frown, color: "border-orange-500 bg-orange-50/50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
    { value: 5, label: "Rất kém", desc: "Suy kiệt, nhiều triệu chứng", icon: AlertTriangle, color: "border-rose-500 bg-rose-50/50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
  ];

  return (
    <div className="space-y-7">
      {/* KHỐI 1: Tự đánh giá sức khỏe tổng quát (5 Thẻ Trạng thái) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            1. Tự đánh giá sức khỏe tổng quát của bạn hiện tại <span className="text-rose-500">*</span>
          </Label>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
            {genHealthLevels.find((l) => l.value === genHlth)?.label}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {genHealthLevels.map((lvl) => {
            const isSelected = genHlth === lvl.value;
            const Icon = lvl.icon;
            return (
              <button
                key={lvl.value}
                type="button"
                onClick={() => setValue("GenHlth", lvl.value, { shouldValidate: true })}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-h-[76px] text-center ${
                  isSelected
                    ? `${lvl.color} shadow-sm font-bold scale-[1.02] ring-2 ring-teal-500/20`
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 ${isSelected ? "" : "text-slate-400"}`} />
                <span className="text-xs font-bold leading-tight">{lvl.label}</span>
                <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{lvl.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KHỐI 2: Thói quen Lối sống với Smart Mapping mức độ/tần suất */}
      <div className="space-y-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
          2. Thói quen Lối sống & Vận động (Đo lường tần suất)
        </h4>

        {/* 2.1 Hút thuốc lá (Smart Mapping 3 mức) */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <Cigarette className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Thói quen hút thuốc lá
              </p>
              <p className="text-[11px] text-slate-500">Mức độ và tần suất hút thuốc</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* Mức 1: Không hút */}
            <button
              type="button"
              onClick={() => {
                setSmokingOption("NONE");
                setValue("Smoker", 0, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                smokingOption === "NONE"
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-semibold text-teal-800 dark:text-teal-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Không hút thuốc</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Chưa từng hút hoặc &lt; 100 điếu</p>
            </button>

            {/* Mức 2: Đã cai hẳn / Hiếm khi (Nút ở giữa) */}
            <button
              type="button"
              onClick={() => {
                setSmokingOption("QUIT");
                setValue("Smoker", 0, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                smokingOption === "QUIT"
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-semibold text-teal-800 dark:text-teal-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Đã cai hẳn / Hiếm khi</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Từng hút nhưng hiện đã dừng</p>
            </button>

            {/* Mức 3: Đang hút thường xuyên */}
            <button
              type="button"
              onClick={() => {
                setSmokingOption("DAILY");
                setValue("Smoker", 1, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                smokingOption === "DAILY"
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 font-semibold text-rose-800 dark:text-rose-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Đang hút thường xuyên</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Hàng ngày hoặc &gt; 100 điếu</p>
            </button>
          </div>
        </div>

        {/* 2.2 Tiêu thụ bia rượu (Smart Mapping 3 mức) */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <Beer className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Mức độ tiêu thụ bia rượu
              </p>
              <p className="text-[11px] text-slate-500">Tần suất và số lượng uống trung bình mỗi tuần</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* Mức 1: Không uống / Rất ít */}
            <button
              type="button"
              onClick={() => {
                setAlcoholOption("NONE");
                setValue("HvyAlcoholConsump", 0, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                alcoholOption === "NONE"
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-semibold text-teal-800 dark:text-teal-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Không uống / Rất ít</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Hầu như không dùng bia rượu</p>
            </button>

            {/* Mức 2: Uống vừa phải (Nút ở giữa) */}
            <button
              type="button"
              onClick={() => {
                setAlcoholOption("MODERATE");
                setValue("HvyAlcoholConsump", 0, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                alcoholOption === "MODERATE"
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-semibold text-teal-800 dark:text-teal-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Uống vừa phải</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Vài ly giao lưu/tuần (&le; 1-2 ly/ngày)</p>
            </button>

            {/* Mức 3: Uống nhiều (Nguy cơ cao) */}
            <button
              type="button"
              onClick={() => {
                setAlcoholOption("HEAVY");
                setValue("HvyAlcoholConsump", 1, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                alcoholOption === "HEAVY"
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 font-semibold text-rose-800 dark:text-rose-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Uống nhiều (Nguy cơ cao)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">&gt; 14 ly/tuần (Nam) hoặc &gt; 7 ly/tuần (Nữ)</p>
            </button>
          </div>
        </div>

        {/* 2.3 Hoạt động thể lực (Smart Mapping 3 mức) */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Thói quen vận động & Thể dục thể thao
              </p>
              <p className="text-[11px] text-slate-500">Mức độ rèn luyện thể chất trong 30 ngày qua</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPhysOption("SEDENTARY");
                setValue("PhysActivity", 0, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                physOption === "SEDENTARY"
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 font-semibold text-amber-900 dark:text-amber-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Lối sống tĩnh tại</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Ngồi nhiều, không tập luyện</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setPhysOption("MODERATE");
                setValue("PhysActivity", 0, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                physOption === "MODERATE"
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-semibold text-teal-800 dark:text-teal-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Vận động nhẹ</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Đi bộ thong thả &lt; 1 lần/tuần</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setPhysOption("ACTIVE");
                setValue("PhysActivity", 1, { shouldValidate: true });
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                physOption === "ACTIVE"
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-semibold text-teal-800 dark:text-teal-200 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold">Tập đều đặn</p>
              <p className="text-[10px] text-slate-500 mt-0.5">&ge; 2–3 buổi/tuần (&ge; 150p)</p>
            </button>
          </div>
        </div>

        {/* 2.4 Dinh dưỡng (Trái cây & Rau xanh) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Trái cây */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center gap-2">
              <Apple className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Ăn hoa quả tươi hàng ngày
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue("Fruits", 1, { shouldValidate: true })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  fruits === 1
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold shadow-xs"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                }`}
              >
                &ge; 1 lần / ngày
              </button>
              <button
                type="button"
                onClick={() => setValue("Fruits", 0, { shouldValidate: true })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  fruits === 0
                    ? "border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                }`}
              >
                Hiếm khi / &lt; 1 lần
              </button>
            </div>
          </div>

          {/* Rau xanh */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
            <div className="flex items-center gap-2">
              <Salad className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Ăn rau xanh trong các bữa
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue("Veggies", 1, { shouldValidate: true })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  veggies === 1
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold shadow-xs"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                }`}
              >
                &ge; 1 lần / ngày
              </button>
              <button
                type="button"
                onClick={() => setValue("Veggies", 0, { shouldValidate: true })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  veggies === 0
                    ? "border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                }`}
              >
                Hiếm khi / &lt; 1 lần
              </button>
            </div>
          </div>
        </div>

        {/* 2.5 Hạn chế vận động (DiffWalk) */}
        <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              <Footprints className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Khó khăn vận động thể chất
              </p>
              <p className="text-[11px] text-slate-500">
                Có gặp khó khăn nghiêm trọng khi đi bộ hoặc leo cầu thang không?
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setValue("DiffWalk", 0, { shouldValidate: true })}
              className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-all ${
                diffWalk === 0
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold"
                  : "border-slate-200 dark:border-slate-800 text-slate-500"
              }`}
            >
              Bình thường
            </button>
            <button
              type="button"
              onClick={() => setValue("DiffWalk", 1, { shouldValidate: true })}
              className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-all ${
                diffWalk === 1
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold"
                  : "border-slate-200 dark:border-slate-800 text-slate-500"
              }`}
            >
              Gặp khó khăn
            </button>
          </div>
        </div>
      </div>

      {/* KHỐI 3: Số ngày đau ốm thể chất & Căng thẳng tinh thần (Thanh trượt Slider + Quick Buttons) */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
          3. Tần suất đau ốm & Căng thẳng trong 30 ngày qua
        </h4>

        {/* 3.1 Sức khỏe thể chất (PhysHlth) */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-teal-600" />
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Số ngày sức khỏe thể chất không tốt (ốm đau, mệt mỏi)
              </Label>
            </div>
            <Badge variant="outline" className="font-bold text-xs bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border-teal-300">
              {physHlth} / 30 ngày
            </Badge>
          </div>

          <Slider
            value={[physHlth]}
            max={30}
            step={1}
            onValueChange={(val) => setValue("PhysHlth", val[0], { shouldValidate: true })}
            className="w-full"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-slate-400">0 ngày (Khỏe mạnh)</span>
            <div className="flex gap-1.5">
              {[0, 3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue("PhysHlth", d, { shouldValidate: true })}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    physHlth === d
                      ? "bg-teal-600 text-white border-teal-600 font-bold"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {d} ngày
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400">30 ngày</span>
          </div>
        </div>

        {/* 3.2 Sức khỏe tinh thần (MentHlth) */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-teal-600" />
              <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Số ngày căng thẳng, stress, lo âu hoặc trầm cảm
              </Label>
            </div>
            <Badge variant="outline" className="font-bold text-xs bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border-teal-300">
              {mentHlth} / 30 ngày
            </Badge>
          </div>

          <Slider
            value={[mentHlth]}
            max={30}
            step={1}
            onValueChange={(val) => setValue("MentHlth", val[0], { shouldValidate: true })}
            className="w-full"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] text-slate-400">0 ngày (Thư thái)</span>
            <div className="flex gap-1.5">
              {[0, 3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue("MentHlth", d, { shouldValidate: true })}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    mentHlth === d
                      ? "bg-teal-600 text-white border-teal-600 font-bold"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {d} ngày
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400">30 ngày</span>
          </div>
        </div>
      </div>
    </div>
  );
}

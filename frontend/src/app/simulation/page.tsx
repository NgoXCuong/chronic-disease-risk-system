"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Cigarette,
  Beer,
  Dumbbell,
  Salad,
  Apple,
  Weight,
  Activity,
  Droplets,
  Heart,
  Brain,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { screeningApi } from "@/lib/api/screening";
import { simulationApi } from "@/lib/api/simulation";
import { WhatIfSimulationResponse, WhatIfDiseaseComparison } from "@/types/simulation";
import { calculateBmi, getAsianBmiCategory } from "@/lib/screening-constants";

const DISEASE_ICONS: Record<string, React.ElementType> = {
  diabetes_binary: Droplets,
  hypertension: Activity,
  cardiovascular: Heart,
  stroke: Brain,
};

export default function SimulationPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Dữ liệu mốc đối chứng ban đầu (Baseline)
  const [baselineInput, setBaselineInput] = useState<Record<string, any>>({
    BMI: 27.5,
    Smoker: 1,
    HvyAlcoholConsump: 1,
    PhysActivity: 0,
    Fruits: 0,
    Veggies: 0,
    GenHlth: 3,
    PhysHlth: 4,
    MentHlth: 5,
    HighBP: 0,
    HighChol: 0,
    CholCheck: 1,
    Stroke: 0,
    HeartDiseaseorAttack: 0,
    DiffWalk: 0,
    Sex: 1,
    Age: 6,
    Education: 4,
    Income: 5,
    AnyHealthcare: 1,
    NoDocbcCost: 0,
  });

  const [heightCm, setHeightCm] = useState(170);
  const [baselineWeight, setBaselineWeight] = useState(80);

  // Các biến can thiệp lối sống (Interventions)
  const [targetWeight, setTargetWeight] = useState(80);
  const [quitSmoking, setQuitSmoking] = useState(false);
  const [cutAlcohol, setCutAlcohol] = useState(false);
  const [doExercise, setDoExercise] = useState(false);
  const [eatHealthy, setEatHealthy] = useState(false);

  // Kết quả mô phỏng từ AI
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResponse | null>(null);

  // 1. Tự động nạp dữ liệu mốc từ lần khảo sát gần nhất nếu có
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Kiểm tra sessionStorage trước
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("last_screening_input");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setBaselineInput(parsed);
            if (parsed.BMI) {
              const estWeight = Math.round(parsed.BMI * 1.7 * 1.7);
              setBaselineWeight(estWeight);
              setTargetWeight(estWeight);
            }
          }
        } catch (e) {
          // Bỏ qua lỗi parse
        }
      }
    }

    // Nếu đã đăng nhập, thử lấy bản ghi gần nhất từ database
    if (isAuthenticated) {
      screeningApi.getHistory(1, 1).then((res) => {
        if (!isMounted) return;
        const item = res.items?.[0];
        if (item?.record_id) {
          screeningApi.getHistoryById(item.record_id).then((detail: any) => {
            if (isMounted && detail?.input_data) {
              setBaselineInput(detail.input_data);
              if (detail.input_data.BMI) {
                const estWeight = Math.round(detail.input_data.BMI * 1.7 * 1.7);
                setBaselineWeight(estWeight);
                setTargetWeight(estWeight);
                setQuitSmoking(detail.input_data.Smoker === 1 ? false : true);
                setDoExercise(detail.input_data.PhysActivity === 1 ? true : false);
              }
            }
          }).catch(() => {});
        }
      }).catch(() => {}).finally(() => {
        if (isMounted) setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  // 2. Hàm gọi API suy luận What-If
  const executeSimulation = useCallback(async (
    newWeight: number,
    isQuitSmoke: boolean,
    isCutAlc: boolean,
    isExercise: boolean,
    isEatHealth: boolean
  ) => {
    try {
      setSimulating(true);

      const heightM = heightCm / 100;
      const newBmi = Number((newWeight / (heightM * heightM)).toFixed(1));

      const modified: Record<string, any> = {
        BMI: newBmi,
        Smoker: isQuitSmoke ? 0 : baselineInput.Smoker,
        HvyAlcoholConsump: isCutAlc ? 0 : baselineInput.HvyAlcoholConsump,
        PhysActivity: isExercise ? 1 : baselineInput.PhysActivity,
        Fruits: isEatHealth ? 1 : baselineInput.Fruits,
        Veggies: isEatHealth ? 1 : baselineInput.Veggies,
        GenHlth: Math.max(1, (baselineInput.GenHlth || 3) - (isExercise && isEatHealth ? 1 : 0)),
      };

      const result = await simulationApi.calculateSimulation({
        baseline_input: baselineInput,
        modified_features: modified,
      });

      setSimulationResult(result);
    } catch (err: any) {
      toast.error("Không thể tính toán mô phỏng. Vui lòng thử lại.");
    } finally {
      setSimulating(false);
    }
  }, [baselineInput, heightCm]);

  // Chạy mô phỏng lần đầu khi baselineInput sẵn sàng
  useEffect(() => {
    if (!loading) {
      executeSimulation(targetWeight, quitSmoking, cutAlcohol, doExercise, eatHealthy);
    }
  }, [loading, baselineInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trình điều khiển thay đổi cân nặng
  const handleWeightChange = (newVal: number) => {
    setTargetWeight(newVal);
    executeSimulation(newVal, quitSmoking, cutAlcohol, doExercise, eatHealthy);
  };

  const handleToggle = (
    type: "smoke" | "alc" | "exercise" | "eat"
  ) => {
    let s = quitSmoking, a = cutAlcohol, ex = doExercise, eat = eatHealthy;
    if (type === "smoke") { s = !quitSmoking; setQuitSmoking(s); }
    if (type === "alc") { a = !cutAlcohol; setCutAlcohol(a); }
    if (type === "exercise") { ex = !doExercise; setDoExercise(ex); }
    if (type === "eat") { eat = !eatHealthy; setEatHealthy(eat); }
    executeSimulation(targetWeight, s, a, ex, eat);
  };

  const handleReset = () => {
    setTargetWeight(baselineWeight);
    setQuitSmoking(false);
    setCutAlcohol(false);
    setDoExercise(false);
    setEatHealthy(false);
    executeSimulation(baselineWeight, false, false, false, false);
    toast.info("Đã thiết lập lại về chỉ số ban đầu.");
  };

  // Tính BMI giả định hiện tại
  const currentSimBmi = Number((targetWeight / ((heightCm / 100) * (heightCm / 100))).toFixed(1));
  const simBmiInfo = getAsianBmiCategory(currentSimBmi);
  const baselineBmi = Number((baselineWeight / ((heightCm / 100) * (heightCm / 100))).toFixed(1));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-7">
          {/* Header Trang Mô phỏng */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 px-3.5 py-1 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200/80">
                <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
                <span>CDSS Counterfactual Simulation Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Mô phỏng Can thiệp Lối sống "What-If"
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Khám phá hiệu quả định lượng của việc thay đổi thói quen sinh hoạt (giảm cân, bỏ thuốc lá, tăng vận động). Hệ thống Machine Learning sẽ dự báo ngay lập tức mức độ giảm nguy cơ mắc 4 bệnh mạn tính.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleReset}
              className="h-11 min-h-[44px] px-4 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2 self-start md:self-center shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" /> Thiết lập lại ban đầu
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
              <Skeleton className="lg:col-span-5 h-[500px] rounded-3xl" />
              <Skeleton className="lg:col-span-7 h-[500px] rounded-3xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* CỘT TRÁI (5 Cột): BẢNG ĐIỀU KHIỂN CAN THIỆP LỐI SỐNG */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-teal-600" />
                      Điều chỉnh Hành vi Giả định
                    </h2>
                    <span className="text-[11px] text-slate-400">Thời gian thực</span>
                  </div>

                  {/* 1. Thanh trượt Cân nặng / BMI mục tiêu */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Weight className="h-4 w-4 text-teal-600" />
                        Cân nặng Mục tiêu
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 dark:text-slate-100">
                          {targetWeight} kg
                        </span>
                        <Badge variant="outline" className={`text-[10px] font-bold ${simBmiInfo.color}`}>
                          BMI: {currentSimBmi}
                        </Badge>
                      </div>
                    </div>

                    <Slider
                      value={[targetWeight]}
                      min={Math.max(40, baselineWeight - 25)}
                      max={Math.min(140, baselineWeight + 15)}
                      step={1}
                      onValueChange={(val) => handleWeightChange(val[0])}
                      className="w-full"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Mốc ban đầu: {baselineWeight} kg (BMI {baselineBmi})</span>
                      <span className={targetWeight < baselineWeight ? "text-emerald-600 font-bold" : ""}>
                        {targetWeight < baselineWeight ? `Giảm ${baselineWeight - targetWeight} kg` : targetWeight > baselineWeight ? `Tăng ${targetWeight - baselineWeight} kg` : "Giữ nguyên"}
                      </span>
                    </div>
                  </div>

                  {/* 2. Các hành vi lối sống có thể thay đổi (Toggle Cards) */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Các thay đổi lối sống tích cực:
                    </span>

                    {/* Toggle: Bỏ hút thuốc lá */}
                    <button
                      type="button"
                      onClick={() => handleToggle("smoke")}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        quitSmoking
                          ? "border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          quitSmoking ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          <Cigarette className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Cai thuốc lá hoàn toàn
                          </p>
                          <p className="text-[10px] text-slate-400">Giảm co thắt mạch & tổn thương phổi</p>
                        </div>
                      </div>
                      <Badge variant={quitSmoking ? "default" : "outline"} className="text-[10px]">
                        {quitSmoking ? "Đã chọn" : "Chưa chọn"}
                      </Badge>
                    </button>

                    {/* Toggle: Cai / Giảm bia rượu */}
                    <button
                      type="button"
                      onClick={() => handleToggle("alc")}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        cutAlcohol
                          ? "border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          cutAlcohol ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          <Beer className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Hạn chế bia rượu nghiêm ngặt
                          </p>
                          <p className="text-[10px] text-slate-400">&le; 1 ly/ngày hoặc không uống</p>
                        </div>
                      </div>
                      <Badge variant={cutAlcohol ? "default" : "outline"} className="text-[10px]">
                        {cutAlcohol ? "Đã chọn" : "Chưa chọn"}
                      </Badge>
                    </button>

                    {/* Toggle: Tập thể thao đều đặn */}
                    <button
                      type="button"
                      onClick={() => handleToggle("exercise")}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        doExercise
                          ? "border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          doExercise ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          <Dumbbell className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Rèn luyện thể lực &ge; 150 phút/tuần
                          </p>
                          <p className="text-[10px] text-slate-400">Đi bộ, chạy bộ, thể thao đều đặn</p>
                        </div>
                      </div>
                      <Badge variant={doExercise ? "default" : "outline"} className="text-[10px]">
                        {doExercise ? "Đã chọn" : "Chưa chọn"}
                      </Badge>
                    </button>

                    {/* Toggle: Dinh dưỡng giàu rau xanh & trái cây */}
                    <button
                      type="button"
                      onClick={() => handleToggle("eat")}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        eatHealthy
                          ? "border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                          eatHealthy ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          <Salad className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Bổ sung rau củ & hoa quả tươi mỗi ngày
                          </p>
                          <p className="text-[10px] text-slate-400">Tăng chất xơ hòa tan, chống oxy hóa</p>
                        </div>
                      </div>
                      <Badge variant={eatHealthy ? "default" : "outline"} className="text-[10px]">
                        {eatHealthy ? "Đã chọn" : "Chưa chọn"}
                      </Badge>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Các biến nhân trắc cố định như Tuổi, Giới tính và Tiền sử đột quỵ/đau tim được khóa bảo toàn để đảm bảo tính khoa học và giá trị y học thực tế.
                  </p>
                </div>
              </div>

              {/* CỘT PHẢI (7 Cột): KẾT QUẢ ĐỐI CHIẾU TRƯỚC VS. SAU CAN THIỆP */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. BANNER TỔNG QUAN MỨC GIẢM NGUY CƠ */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Hiệu quả Can thiệp Dự báo (AI Counterfactual)
                    </span>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold">
                      {simulating ? "Đang tính..." : "Cập nhật tức thì"}
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">
                      -{simulationResult?.average_risk_reduction || 0}%
                    </span>
                    <span className="text-sm font-semibold text-emerald-100">
                      Mức giảm nguy cơ trung bình trên cả 4 bệnh mạn tính
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed pt-1 border-t border-white/15">
                    {simulationResult?.overall_clinical_summary || "Đang tính toán kết quả đối chiếu..."}
                  </p>
                </div>

                {/* 2. MA TRẬN ĐỐI CHIẾU TRƯỚC VS. SAU CHO TỪNG BỆNH LÝ */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    So sánh Đối xứng Rủi ro Từng Bệnh (Before vs. After)
                  </h3>

                  <div className="grid grid-cols-1 gap-3.5">
                    {simulationResult?.comparisons.map((c) => {
                      const Icon = DISEASE_ICONS[c.disease] || Activity;
                      const isReduced = c.delta_percentage < 0;

                      return (
                        <div
                          key={c.disease}
                          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                  {c.disease_name_vi}
                                </h4>
                                <p className="text-[10px] text-slate-400">So sánh xác suất rủi ro</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isReduced ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs gap-1">
                                  <TrendingDown className="h-3.5 w-3.5" />
                                  Giảm {Math.abs(c.delta_percentage)}%
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500 text-xs">
                                  Ổn định ({c.delta_percentage}%)
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Thanh so sánh trực quan Trước vs. Sau */}
                          <div className="grid grid-cols-2 gap-4 pt-1">
                            {/* Trước can thiệp */}
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Trước can thiệp</span>
                                <Badge variant="outline" className="text-[9px]">
                                  {c.baseline_risk_level === "HIGH" ? "Nguy cơ Cao" : c.baseline_risk_level === "MEDIUM" ? "Trung bình" : "Thấp"}
                                </Badge>
                              </div>
                              <p className="text-xl font-black text-slate-700 dark:text-slate-300">
                                {Math.round(c.baseline_risk_percentage)}%
                              </p>
                              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div
                                  className="h-full bg-slate-400 rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(5, c.baseline_risk_percentage))}%` }}
                                />
                              </div>
                            </div>

                            {/* Sau can thiệp */}
                            <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-300 font-semibold">
                                <span>Sau can thiệp</span>
                                <Badge className="bg-teal-600 text-white text-[9px] font-bold">
                                  {c.simulated_risk_level === "HIGH" ? "Nguy cơ Cao" : c.simulated_risk_level === "MEDIUM" ? "Trung bình" : "Thấp"}
                                </Badge>
                              </div>
                              <p className="text-xl font-black text-teal-700 dark:text-teal-300">
                                {Math.round(c.simulated_risk_percentage)}%
                              </p>
                              <div className="h-2 w-full rounded-full bg-teal-100 dark:bg-teal-900 overflow-hidden">
                                <div
                                  className="h-full bg-teal-600 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(5, c.simulated_risk_percentage))}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Thông điệp lâm sàng */}
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50/60 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            💡 {c.clinical_message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Các nút hành động */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <Link href="/screening" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800">
                      Khảo sát Sàng lọc Lại
                    </Button>
                  </Link>

                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-11 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-1.5 shadow-sm">
                      Về Bảng Điều Khiển <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

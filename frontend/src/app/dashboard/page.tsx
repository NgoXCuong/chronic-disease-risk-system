"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LogIn,
  UserPlus,
  ShieldAlert,
  HeartPulse,
  Activity,
  PlusCircle,
  History,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Droplets,
  Heart,
  Brain,
  Ruler,
  Weight,
  User,
  ExternalLink,
  Bot,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usersApi } from "@/lib/api/users";
import { screeningApi } from "@/lib/api/screening";
import { PatientProfile } from "@/types/auth";
import { ScreeningHistoryItem } from "@/types/screening";
import { getAsianBmiCategory, calculateBmi } from "@/lib/screening-constants";
import { TrajectoryChartCard } from "@/components/dashboard/TrajectoryChartCard";
import { RecentScreeningsCard } from "@/components/dashboard/RecentScreeningsCard";
import { DashboardRecommendations } from "@/components/dashboard/DashboardRecommendations";

const DISEASE_META: Record<string, { name: string; icon: React.ElementType; desc: string }> = {
  diabetes_binary: { name: "Đái tháo đường Týp 2", icon: Droplets, desc: "Rối loạn chuyển hóa glucose & kháng insulin" },
  hypertension: { name: "Tăng huyết áp", icon: Activity, desc: "Áp lực dòng máu lên thành động mạch" },
  cardiovascular: { name: "Bệnh tim mạch vành", icon: Heart, desc: "Xơ vữa động mạch & nguy cơ đau tim" },
  stroke: { name: "Đột quỵ não", icon: Brain, desc: "Thiếu máu cục bộ hoặc xuất huyết não" },
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<ScreeningHistoryItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    setDataLoading(true);

    Promise.allSettled([
      usersApi.getProfile(),
      screeningApi.getHistory(1, 10),
    ]).then(([profileRes, historyRes]) => {
      if (!isMounted) return;
      if (profileRes.status === "fulfilled") setProfile(profileRes.value);
      if (historyRes.status === "fulfilled") setRecords(historyRes.value?.items || []);
      setDataLoading(false);
    });

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  // Tính toán các chỉ số cơ thể
  const effectiveProfile = profile || user?.profile;
  const height = effectiveProfile?.height_cm || 165;
  const weight = effectiveProfile?.weight_kg || 60;
  const bmi = effectiveProfile?.bmi || calculateBmi(height, weight);
  const bmiInfo = getAsianBmiCategory(bmi);
  const genderLabel = effectiveProfile?.gender === "MALE" ? "Nam" : effectiveProfile?.gender === "FEMALE" ? "Nữ" : "Chưa cập nhật";

  // Lấy bản ghi sàng lọc mới nhất
  const latestRecord = records[0] || null;

  // Lời chào theo buổi trong ngày
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const displayName = effectiveProfile?.full_name || user?.email?.split("@")[0] || "Người dùng";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 dark:bg-slate-950 transition-colors">
      {/* 1. Header Điều hướng Hệ thống (Navbar) */}
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        {/* Trường hợp: Đang tải thông tin */}
        {authLoading || (isAuthenticated && dataLoading) ? (
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        ) : !isAuthenticated ? (
          /* Trường hợp: Chưa đăng nhập */
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center space-y-5">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Yêu cầu Đăng nhập Tài khoản
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Để bảo vệ quyền riêng tư dữ liệu sức khỏe y tế (PHI) và theo dõi lịch sử nguy cơ qua chuỗi thời gian, vui lòng đăng nhập tài khoản của bạn.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/login">
                <Button className="h-11 min-h-[44px] px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/20">
                  <LogIn className="h-4 w-4" /> Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="h-11 min-h-[44px] px-6 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                  <UserPlus className="h-4 w-4" /> Đăng ký mới
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Trường hợp: Đã đăng nhập - Toàn bộ Giao diện Dashboard Y tế Mới */
          <div className="max-w-7xl mx-auto space-y-7">
            {/* KHỐI 1: HERO BANNER CHÀO MỪNG HIỆN ĐẠI */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-teal-900/10">
              {/* Trang trí background */}
              <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
              <div className="absolute right-20 top-4 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-teal-200 text-xs font-semibold border border-white/15">
                    <HeartPulse className="h-3.5 w-3.5 text-teal-300 animate-pulse" />
                    <span>Hệ thống Giám sát & Quản trị Rủi ro Sức khỏe Cá nhân</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {getGreeting()}, {displayName}!
                  </h1>

                  <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
                    Theo dõi liên tục các chỉ số sinh học, đánh giá phân tầng rủi ro 4 bệnh mạn tính không lây bằng Machine Learning và nhận khuyến cáo lối sống cá nhân hóa.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-teal-200/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-teal-400" />
                      Lần sàng lọc gần nhất: {latestRecord ? new Date(latestRecord.created_at).toLocaleDateString("vi-VN") : "Chưa có"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Hồ sơ: Đã xác thực
                    </span>
                  </div>
                </div>

                {/* Các nút hành động CTA nổi bật */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Link href="/screening">
                    <Button className="h-12 min-h-[44px] px-6 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition-transform hover:scale-[1.02]">
                      <Sparkles className="h-4 w-4 text-teal-600" />
                      Khảo sát Nguy cơ Mới
                    </Button>
                  </Link>

                  <Link href="/chat">
                    <Button variant="outline" className="h-12 min-h-[44px] px-5 rounded-2xl bg-teal-800/50 hover:bg-teal-800/80 border-teal-300/30 text-white font-semibold text-xs flex items-center justify-center gap-2 backdrop-blur-sm">
                      <Bot className="h-4 w-4 text-teal-300" />
                      Hỏi Trợ lý AI
                    </Button>
                  </Link>

                  <Link href="/history">
                    <Button variant="outline" className="h-12 min-h-[44px] px-5 rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 backdrop-blur-sm">
                      <History className="h-4 w-4 text-teal-200" />
                      Lịch sử
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* KHỐI 2: 4 THẺ CHỈ SỐ SINH TRẮC & TỔNG QUAN (KEY HEALTH METRICS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Thẻ 1: BMI & Thể trạng */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <Activity className="h-4 w-4 text-teal-600" />
                    Chỉ số BMI
                  </span>
                  <Badge variant="outline" className={`text-[10px] font-bold ${bmiInfo.color}`}>
                    {bmiInfo.label}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{bmi}</span>
                  <span className="text-xs text-slate-400">kg/m² (Chuẩn Châu Á)</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{bmiInfo.description}</p>
              </div>

              {/* Thẻ 2: Chiều cao & Cân nặng */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <Weight className="h-4 w-4 text-teal-600" />
                    Thể hình Cơ bản
                  </span>
                  <Link href="/profile" className="text-[11px] text-teal-600 hover:underline">
                    Chỉnh sửa
                  </Link>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Chiều cao</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{height} cm</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cân nặng</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{weight} kg</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Giới tính</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{genderLabel}</span>
                  </div>
                </div>
              </div>

              {/* Thẻ 3: Mức nguy cơ cao nhất hiện tại */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Cảnh báo Rủi ro Cao nhất
                  </span>
                </div>
                {latestRecord ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black ${
                        latestRecord.highest_risk_level === "HIGH"
                          ? "text-rose-600"
                          : latestRecord.highest_risk_level === "MEDIUM"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}>
                        {Math.round(latestRecord.highest_risk_score * 100)}%
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {latestRecord.highest_risk_level === "HIGH" ? "Mức Nguy cơ Cao" : latestRecord.highest_risk_level === "MEDIUM" ? "Nguy cơ Trung bình" : "Nguy cơ Thấp"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      Ghi nhận tại lần đánh giá gần nhất
                    </p>
                  </>
                ) : (
                  <div className="text-slate-400 text-xs py-1">Chưa có kết quả sàng lọc</div>
                )}
              </div>

              {/* Thẻ 4: Tổng số lần theo dõi */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <History className="h-4 w-4 text-teal-600" />
                    Theo dõi Chuỗi thời gian
                  </span>
                  <Badge variant="outline" className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 border-teal-200">
                    {records.length} mốc đánh giá
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{records.length}</span>
                  <span className="text-xs text-slate-400">lần thực hiện khảo sát</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {records.length >= 2 ? "Đã đủ mốc phân tích xu hướng biến thiên" : "Cần thêm mốc để vẽ biểu đồ diễn tiến"}
                </p>
              </div>
            </div>

            {/* KHỐI 3: MA TRẬN KẾT QUẢ ĐÁNH GIÁ 4 BỆNH MẠN TÍNH GẦN NHẤT */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Kết quả Phân tầng Rủi ro 4 Bệnh Mạn tính</span>
                    {latestRecord && (
                      <span className="text-xs font-normal text-slate-400">
                        (Khảo sát ngày {new Date(latestRecord.created_at).toLocaleDateString("vi-VN")})
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Suy luận đồng thời từ 4 mô hình Machine Learning chuyên biệt (XGBoost Calibrated)
                  </p>
                </div>

                <Link href="/screening">
                  <Button variant="ghost" size="sm" className="text-xs text-teal-600 hover:text-teal-700 font-semibold gap-1">
                    Khảo sát lại <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {!latestRecord ? (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
                  <ShieldCheck className="h-10 w-10 text-teal-600 mx-auto opacity-70" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    Bạn chưa thực hiện bài khảo sát nào. Hãy dành 2 phút làm khảo sát lối sống để hệ thống tính toán điểm nguy cơ và đưa ra các khuyến nghị y tế phù hợp.
                  </p>
                  <Link href="/screening">
                    <Button className="h-10 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-1.5 shadow-sm">
                      <Sparkles className="h-4 w-4" /> Bắt đầu khảo sát ngay
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {latestRecord.screened_diseases?.map((d) => {
                    const meta = DISEASE_META[d.disease] || { name: d.disease, icon: Activity, desc: "Bệnh lý mạn tính" };
                    const Icon = meta.icon;
                    const rawScore = typeof d.risk_percentage === "number" && !isNaN(d.risk_percentage)
                      ? d.risk_percentage
                      : typeof d.risk_score === "number" && !isNaN(d.risk_score)
                      ? d.risk_score * 100
                      : typeof d.score === "number" && !isNaN(d.score)
                      ? d.score * 100
                      : 0;
                    const scorePct = Math.round(rawScore);

                    const isHigh = d.risk_level === "HIGH";
                    const isMed = d.risk_level === "MEDIUM";

                    const badgeStyle = isHigh
                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                      : isMed
                      ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";

                    const progressColor = isHigh
                      ? "bg-rose-500"
                      : isMed
                      ? "bg-amber-500"
                      : "bg-teal-500";

                    return (
                      <div
                        key={d.disease}
                        className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between gap-4 ${
                          isHigh
                            ? "border-rose-200 dark:border-rose-900/60 shadow-xs"
                            : "border-slate-200/80 dark:border-slate-800 shadow-xs"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                              isHigh
                                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60"
                                : "bg-teal-50 text-teal-600 dark:bg-teal-950/60"
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <Badge variant="outline" className={`text-[10px] font-bold ${badgeStyle}`}>
                              {d.risk_level === "HIGH" ? "Nguy cơ Cao" : d.risk_level === "MEDIUM" ? "Trung bình" : "Nguy cơ Thấp"}
                            </Badge>
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{meta.name}</h3>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{meta.desc}</p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] text-slate-500 font-medium">Xác suất nguy cơ</span>
                            <span className="text-xl font-black text-slate-900 dark:text-slate-100">{scorePct}%</span>
                          </div>

                          {/* Progress bar mức nguy cơ */}
                          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                              style={{ width: `${Math.min(100, Math.max(5, scorePct))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>Phân tầng lâm sàng</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {d.risk_level === "HIGH" ? "Mức Cảnh Báo Cao" : d.risk_level === "MEDIUM" ? "Cần Theo Dõi" : "Ngưỡng An Toàn"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* KHỐI 4: BIỂU ĐỒ DIỄN TIẾN NGUY CƠ CHUỖI THỜI GIAN */}
            <TrajectoryChartCard />

            {/* KHỐI 5: LỊCH SỬ GẦN ĐÂY & KHUYẾN NGHỊ Y TẾ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentScreeningsCard records={records} />
              <DashboardRecommendations />
            </div>
          </div>
        )}
      </main>

      {/* 2. Footer Hệ thống */}
      <Footer />
    </div>
  );
}

import * as React from "react";
import Link from "next/link";
import { Activity, BrainCircuit, CheckCircle2, Clock, History, Ruler, Weight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAsianBMICategory } from "@/components/common/BMICalculatorCard";
import { PatientProfile } from "@/types/auth";
import { LoadedModel } from "@/types/screening";

interface DashboardStatsGridProps {
  loading: boolean;
  profile?: PatientProfile | null;
  totalScreenings: number;
  lastScreeningDate?: string | null;
  models: LoadedModel[];
}

export function DashboardStatsGrid({
  loading,
  profile,
  totalScreenings,
  lastScreeningDate,
  models,
}: DashboardStatsGridProps) {
  const bmi = profile?.bmi;
  const bmiCategory = bmi ? getAsianBMICategory(bmi) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {/* Card 1: Thể trạng & BMI */}
      <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Thể trạng &amp; BMI
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-medical-50 dark:bg-medical-950/80 flex items-center justify-center text-medical-600 dark:text-medical-400">
            <Activity className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : profile?.height_cm && profile?.weight_kg ? (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {bmi?.toFixed(1) || "---"} <span className="text-xs font-normal text-slate-500">kg/m²</span>
                </span>
                {bmiCategory && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${bmiCategory.badgeClass}`}>
                    {bmiCategory.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{profile.height_cm} cm</span>
                <span className="flex items-center gap-1"><Weight className="w-3.5 h-3.5" />{profile.weight_kg} kg</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-1">
              <p>Chưa có dữ liệu thể trạng.</p>
              <Link href="/profile" className="text-medical-600 font-bold hover:underline inline-block mt-1">
                Cập nhật chiều cao, cân nặng →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 2: Lịch sử Sàng lọc */}
      <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Đợt Khảo sát Đã Thực hiện
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/80 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <History className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : (
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {totalScreenings} <span className="text-xs font-normal text-slate-500">lần khảo sát</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {lastScreeningDate ? `Lần cuối: ${new Date(lastScreeningDate).toLocaleDateString("vi-VN")}` : "Chưa có đợt khảo sát nào"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Hạ tầng AI trong RAM */}
      <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Mô hình AI Đang Nạp
          </CardTitle>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BrainCircuit className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : (
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {models.length || "5"} <span className="text-xs font-normal text-slate-500">mô hình hiệu chuẩn</span>
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sẵn sàng phân tích nguy cơ tức thì
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

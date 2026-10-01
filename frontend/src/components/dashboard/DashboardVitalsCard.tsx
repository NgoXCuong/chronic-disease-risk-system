import React from "react";
import Link from "next/link";
import { Activity, Ruler, Weight, UserCircle, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientProfile } from "@/types/auth";
import { getAsianBmiCategory, calculateBmi } from "@/lib/screening-constants";

interface Props {
  profile?: PatientProfile | null;
}

export function DashboardVitalsCard({ profile }: Props) {
  const height = profile?.height_cm || 165;
  const weight = profile?.weight_kg || 60;
  const bmi = profile?.bmi || calculateBmi(height, weight);
  const bmiInfo = getAsianBmiCategory(bmi);
  const genderLabel = profile?.gender === "MALE" ? "Nam" : profile?.gender === "FEMALE" ? "Nữ" : "Chưa cập nhật";

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Activity className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Chỉ số Sinh trắc Thể chất</h2>
        </div>
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg">
            <Edit3 className="h-3.5 w-3.5 mr-1" />
            Cập nhật
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Chiều cao */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
            <Ruler className="h-3.5 w-3.5 text-teal-500" />
            Chiều cao
          </div>
          <p className="text-lg font-black text-slate-800 dark:text-slate-100">
            {height} <span className="text-xs font-normal text-slate-500">cm</span>
          </p>
        </div>

        {/* Cân nặng */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
            <Weight className="h-3.5 w-3.5 text-teal-500" />
            Cân nặng
          </div>
          <p className="text-lg font-black text-slate-800 dark:text-slate-100">
            {weight} <span className="text-xs font-normal text-slate-500">kg</span>
          </p>
        </div>

        {/* BMI */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Chỉ số BMI</span>
            <span className="text-[10px] text-teal-600 font-bold">WHO Á</span>
          </div>
          <p className="text-lg font-black text-teal-600 dark:text-teal-400">
            {bmi} <span className="text-xs font-normal text-slate-500">kg/m²</span>
          </p>
        </div>

        {/* Giới tính */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
            <UserCircle className="h-3.5 w-3.5 text-teal-500" />
            Giới tính
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 pt-0.5">
            {genderLabel}
          </p>
        </div>
      </div>

      {/* Đánh giá thể trạng */}
      <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${bmiInfo.color}`}>
        <div>
          <span className="text-xs font-bold block">{bmiInfo.label}</span>
          <span className="text-[11px] opacity-90">{bmiInfo.description}</span>
        </div>
        <Badge variant="outline" className="border-current text-[11px] shrink-0 font-bold">
          {bmi}
        </Badge>
      </div>
    </div>
  );
}

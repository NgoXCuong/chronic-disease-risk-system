"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultHeaderProps {
  recordedAt: string;
}

export function ResultHeader({ recordedAt }: ResultHeaderProps) {
  const formattedDate = new Date(recordedAt).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-50 dark:bg-medical-950/60 border border-medical-200 dark:border-medical-800 text-medical-700 dark:text-medical-300 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-medical-600" />
          Báo cáo Phân tích AI Hoàn tất
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Kết quả Đánh giá Nguy cơ
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Thời điểm thực hiện: <strong>{formattedDate}</strong>
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Link href="/screening">
          <Button variant="outline" size="sm" className="gap-1.5 min-h-[44px]">
            <RefreshCw className="w-3.5 h-3.5" /> Khảo sát mới
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="sm" className="gap-1.5 shadow-sm min-h-[44px]">
            <ArrowLeft className="w-3.5 h-3.5" /> Về Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

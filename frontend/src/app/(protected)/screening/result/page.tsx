"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileDown,
  HeartPulse,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskGauge } from "@/components/screening/RiskGauge";
import { RecommendationsList } from "@/components/screening/RecommendationsList";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { RiskBadge } from "@/components/common/RiskBadge";
import api from "@/lib/api";
import { RiskLevel } from "@/types/screening";

// Dynamic import Recharts component theo Trụ cột 2.3 để tối ưu kích thước bundle
const DynamicShapBarChart = dynamic(
  () => import("@/components/screening/ShapBarChart").then((mod) => mod.ShapBarChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
  }
);

interface ScreeningResultDetail {
  id: string;
  disease_type: string;
  disease_name_vi: string;
  risk_score: number;
  risk_percentage: number;
  risk_level: RiskLevel;
  optimal_threshold: number;
  is_above_threshold: boolean;
  top_risk_factors: any[];
  recommendations: string[];
}

interface RecordDetail {
  id: string;
  recorded_at: string;
  record_type: string;
  notes?: string;
  screening_results: ScreeningResultDetail[];
}

function ScreeningResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordId = searchParams.get("record_id");

  const [loading, setLoading] = React.useState(true);
  const [record, setRecord] = React.useState<RecordDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedDiseaseIndex, setSelectedDiseaseIndex] = React.useState(0);

  React.useEffect(() => {
    if (!recordId) {
      setError("Không tìm thấy mã khảo sát (record_id). Vui lòng thực hiện sàng lọc lại.");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/screening/history/${recordId}`);
        setRecord(res.data);
      } catch (err: any) {
        setError(err.message || "Không thể tải kết quả phân tích AI từ máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [recordId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !record || !record.screening_results?.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="w-5 h-5" />
          <AlertDescription>{error || "Không có dữ liệu kết quả sàng lọc."}</AlertDescription>
        </Alert>
        <Link href="/screening">
          <Button className="gap-2">
            <RefreshCw className="w-4 h-4" /> Bắt đầu Khảo sát mới
          </Button>
        </Link>
      </div>
    );
  }

  const selectedResult = record.screening_results[selectedDiseaseIndex] || record.screening_results[0];
  const formattedDate = new Date(record.recorded_at).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Điều hướng & Hành động */}
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
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Khảo sát mới
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Về Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Selector chọn bệnh lý (Tabs) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Chọn bệnh lý để xem chi tiết ({record.screening_results.length} mô hình đã đánh giá):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {record.screening_results.map((item, idx) => {
            const isSelected = idx === selectedDiseaseIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedDiseaseIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[64px] select-none ${
                  isSelected
                    ? "bg-medical-50/80 border-medical-500 shadow-sm dark:bg-medical-950/40 dark:border-medical-500"
                    : "bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850"
                }`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {item.disease_name_vi}
                </span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {item.risk_percentage.toFixed(1)}%
                  </span>
                  <RiskBadge level={item.risk_level} size="sm" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chi tiết Bệnh lý được chọn */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Cột trái: Thước đo rủi ro Radial Gauge */}
          <RiskGauge
            score={selectedResult.risk_score}
            percentage={selectedResult.risk_percentage}
            level={selectedResult.risk_level}
            threshold={selectedResult.optimal_threshold}
            diseaseName={selectedResult.disease_name_vi}
          />

          {/* Cột phải: Biểu đồ SHAP XAI */}
          <DynamicShapBarChart factors={selectedResult.top_risk_factors} />
        </div>

        {/* Khuyến nghị Chăm sóc & Theo dõi */}
        <RecommendationsList
          recommendations={selectedResult.recommendations}
          riskLevel={selectedResult.risk_level}
        />
      </div>

      {/* Tuyên bố miễn trừ trách nhiệm y tế */}
      <MedicalDisclaimer />
    </div>
  );
}

export default function ScreeningResultPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <ScreeningResultContent />
    </React.Suspense>
  );
}

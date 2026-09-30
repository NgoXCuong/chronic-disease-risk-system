"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskGauge } from "@/components/screening/RiskGauge";
import { RecommendationsList } from "@/components/screening/RecommendationsList";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { ResultHeader } from "@/components/screening/result/ResultHeader";
import { ResultDiseaseTabs } from "@/components/screening/result/ResultDiseaseTabs";
import api from "@/lib/api";
import { RiskLevel } from "@/types/screening";

// Dynamic import Recharts component theo Trụ cột 3 để tối ưu bundle size
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
          <Button className="gap-2 min-h-[44px]">
            <RefreshCw className="w-4 h-4" /> Bắt đầu Khảo sát mới
          </Button>
        </Link>
      </div>
    );
  }

  const selectedResult = record.screening_results[selectedDiseaseIndex] || record.screening_results[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Điều hướng & Hành động */}
      <ResultHeader recordedAt={record.recorded_at} />

      {/* Bộ thẻ chọn bệnh lý */}
      <ResultDiseaseTabs
        items={record.screening_results}
        selectedIndex={selectedDiseaseIndex}
        onSelect={setSelectedDiseaseIndex}
      />

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

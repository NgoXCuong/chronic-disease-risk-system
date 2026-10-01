import React from "react";
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { DiseasePrediction } from "@/types/screening";
import { Badge } from "@/components/ui/badge";
import { ShapAttributionBar } from "./ShapAttributionBar";

interface Props {
  prediction: DiseasePrediction;
}

export function DiseaseResultCard({ prediction }: Props) {
  const getRiskVariant = (level: string) => {
    switch (level) {
      case "HIGH":
        return {
          label: "NGUY CƠ CAO",
          badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400",
          cardBorder: "border-rose-200/80 dark:border-rose-900/50",
          scoreColor: "text-rose-600 dark:text-rose-400",
          icon: AlertTriangle,
        };
      case "MEDIUM":
        return {
          label: "NGUY CƠ TRUNG BÌNH",
          badge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400",
          cardBorder: "border-amber-200/80 dark:border-amber-900/50",
          scoreColor: "text-amber-600 dark:text-amber-400",
          icon: Info,
        };
      default:
        return {
          label: "NGUY CƠ THẤP",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400",
          cardBorder: "border-emerald-200/80 dark:border-emerald-900/50",
          scoreColor: "text-emerald-600 dark:text-emerald-400",
          icon: CheckCircle2,
        };
    }
  };

  const style = getRiskVariant(prediction.risk_level);
  const StatusIcon = style.icon;

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border ${style.cardBorder} shadow-lg shadow-slate-200/30 dark:shadow-none space-y-6 transition-all`}>
      {/* Header Thẻ Bệnh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${style.scoreColor}`} />
            {prediction.disease_name_vi || prediction.disease}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mô hình phân loại Machine Learning đã hiệu chuẩn xác suất lâm sàng.
          </p>
        </div>
        <div>
          <Badge className={`px-3 py-1 rounded-xl text-xs font-bold border ${style.badge}`}>
            {style.label}
          </Badge>
        </div>
      </div>

      {/* Điểm số nguy cơ & Ngưỡng báo động */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">
            Ước tính Nguy cơ
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl sm:text-4xl font-black ${style.scoreColor}`}>
              {prediction.risk_percentage}%
            </span>
          </div>
        </div>

        <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">
            Ngưỡng Cảnh báo Tối ưu
          </span>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">
            {(prediction.optimal_threshold * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {prediction.risk_score >= prediction.optimal_threshold
              ? "⚠️ Điểm số vượt ngưỡng cảnh báo"
              : "✅ Điểm số nằm trong vùng an toàn"}
          </p>
        </div>
      </div>

      {/* Phân tích Đóng góp Yếu tố TreeSHAP XAI (FR-10, FR-11) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Yếu tố Thúc đẩy & Bảo vệ Sức khỏe (TreeSHAP XAI)
        </h4>
        <ShapAttributionBar factors={prediction.top_risk_factors} />
      </div>

      {/* Khuyến nghị Lâm sàng */}
      {prediction.recommendations && prediction.recommendations.length > 0 && (
        <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200">
            <Lightbulb className="h-4 w-4 text-teal-600" />
            <span>Khuyến nghị Lối sống & Can thiệp Y tế:</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs text-teal-950/80 dark:text-teal-200/80">
            {prediction.recommendations.map((rec, i) => (
              <li key={i} className="leading-relaxed">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

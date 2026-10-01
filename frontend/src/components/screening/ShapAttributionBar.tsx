import React from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { RiskFactor } from "@/types/screening";

interface Props {
  factors: RiskFactor[];
}

export function ShapAttributionBar({ factors }: Props) {
  if (!factors || factors.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">
        Không có dữ liệu phân tích đóng góp yếu tố rủi ro.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {factors.map((item, idx) => {
        const isRisk = item.impact.includes("+") || (item.shap_value && item.shap_value > 0);

        return (
          <div
            key={idx}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              isRisk
                ? "bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-900 dark:text-rose-200"
                : "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  isRisk
                    ? "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isRisk ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
              </div>
              <div className="truncate">
                <span className="font-bold block truncate">
                  {item.feature_name_vi || item.feature}
                </span>
                <span className="text-[11px] opacity-75">
                  Chỉ số thực tế: <strong className="font-semibold">{item.value}</strong>
                </span>
              </div>
            </div>

            <div className="text-right shrink-0 pl-2">
              <span
                className={`font-black text-xs ${
                  isRisk ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {item.impact}
              </span>
              <span className="block text-[10px] opacity-60">
                {isRisk ? "Thúc đẩy nguy cơ" : "Yếu tố bảo vệ"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

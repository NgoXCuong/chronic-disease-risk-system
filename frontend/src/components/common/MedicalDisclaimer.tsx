import React from "react";
import { Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicalDisclaimerProps {
  variant?: "standard" | "compact" | "banner";
  className?: string;
}

export function MedicalDisclaimer({
  variant = "standard",
  className,
}: MedicalDisclaimerProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-300",
          className
        )}
      >
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          Kết quả chỉ mang tính sàng lọc hỗ trợ quyết định (CDSS), không thay thế kết luận lâm sàng của bác sĩ.
        </span>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "bg-medical-950 text-medical-100 border-y border-medical-800/60 py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2 dark:bg-slate-950 dark:border-slate-800 dark:text-teal-200",
          className
        )}
      >
        <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          <strong>Lưu ý pháp lý y tế:</strong> Hệ thống sử dụng Machine Learning để phân tầng nguy cơ sơ bộ, không đưa ra chẩn đoán xác định hay kê đơn điều trị.
        </span>
      </div>
    );
  }

  // Standard Box
  return (
    <div
      className={cn(
        "rounded-xl border border-teal-200/80 bg-teal-50/70 p-4 text-xs text-teal-950 flex items-start gap-3 shadow-sm dark:bg-slate-900/90 dark:border-teal-900/60 dark:text-slate-200",
        className
      )}
    >
      <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 shrink-0 mt-0.5 dark:bg-teal-950 dark:text-teal-300">
        <Info className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <div className="font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wide">
          Tuyên bố miễn trừ trách nhiệm y tế (Medical Disclaimer)
        </div>
        <p className="text-teal-800/90 dark:text-slate-300 leading-relaxed">
          Kết quả đánh giá trên hệ thống chỉ mang tính chất tham khảo, hỗ trợ sàng lọc sớm và nâng cao nhận thức sức khỏe ban đầu trong cộng đồng. 
          Hệ thống <strong>tuyệt đối không thay thế</strong> chẩn đoán y khoa, xét nghiệm khẳng định hoặc phác đồ điều trị của bác sĩ chuyên khoa. 
          Nếu xuất hiện các dấu hiệu bất thường cấp tính, vui lòng đến ngay cơ sở y tế gần nhất hoặc gọi tổng đài cấp cứu 115.
        </p>
      </div>
    </div>
  );
}

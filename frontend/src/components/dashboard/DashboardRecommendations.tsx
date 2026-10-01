import React from "react";
import Link from "next/link";
import { Sparkles, HeartPulse, Apple, Dumbbell, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardRecommendations() {
  const tips = [
    {
      icon: Dumbbell,
      title: "Duy trì vận động thể chất",
      desc: "Tối thiểu 150 phút thể dục cường độ trung bình (đi bộ nhanh, bơi lội, đạp xe) mỗi tuần để bảo vệ hệ tim mạch.",
    },
    {
      icon: Apple,
      title: "Chế độ ăn giàu chất xơ & giảm muối",
      desc: "Ưu tiên rau củ quả tươi, ngũ cốc nguyên hạt; hạn chế muối < 5g/ngày để kiểm soát huyết áp ổn định.",
    },
    {
      icon: HeartPulse,
      title: "Đo huyết áp & đường huyết định kỳ",
      desc: "Theo dõi chỉ số mỗi tháng một lần và thực hiện lại bài khảo sát khi có thay đổi về lối sống hoặc cân nặng.",
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Khuyến Nghị Sức Khỏe Phòng Ngừa</h2>
        </div>
        <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
          Theo WHO & Bộ Y tế
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tips.map((tip, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
              <tip.icon className="h-4 w-4 shrink-0" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{tip.title}</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {tip.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="text-[11px] leading-tight">
            Kết quả phân tích từ hệ thống mang tính chất sàng lọc phát hiện sớm, không thay thế chẩn đoán chuyên khoa của bác sĩ.
          </span>
        </div>
      </div>
    </div>
  );
}

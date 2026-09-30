"use client";

import * as React from "react";
import { RiskBadge } from "@/components/common/RiskBadge";
import { RiskLevel } from "@/types/screening";

interface DiseaseItem {
  id: string;
  disease_name_vi: string;
  risk_percentage: number;
  risk_level: RiskLevel;
}

interface ResultDiseaseTabsProps {
  items: DiseaseItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ResultDiseaseTabs({
  items,
  selectedIndex,
  onSelect,
}: ResultDiseaseTabsProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Chọn bệnh lý để xem chi tiết ({items.length} mô hình đã đánh giá):
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(idx)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[64px] select-none ${
                isSelected
                  ? "bg-medical-50/80 border-medical-500 shadow-sm dark:bg-medical-950/40 dark:border-medical-500 ring-2 ring-medical-500/20"
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
  );
}

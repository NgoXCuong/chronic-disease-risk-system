"use client";

import { NearbyFacilityItem } from "@/types/facility";
import { FacilityCard } from "./FacilityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, SearchX } from "lucide-react";

interface FacilityListProps {
  facilities: NearbyFacilityItem[];
  selectedFacility: NearbyFacilityItem | null;
  onSelectFacility: (facility: NearbyFacilityItem) => void;
  isLoading: boolean;
  radiusKm: number;
}

/**
 * Danh sách hiển thị các thẻ cơ sở y tế lân cận có cuộn độc lập (FR-24, FR-25).
 */
export function FacilityList({
  facilities,
  selectedFacility,
  onSelectFacility,
  isLoading,
  radiusKm,
}: FacilityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-xl space-y-2 bg-white dark:bg-slate-900 border-slate-200">
            <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-3 w-full bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <SearchX className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            Không tìm thấy cơ sở y tế trong bán kính {radiusKm} km
          </h4>
          <p className="text-xs text-slate-500 max-w-xs">
            Hãy thử mở rộng bán kính quét hoặc chuyển đổi chuyên khoa / tỉnh thành phố khác.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Building2 className="w-3.5 h-3.5 text-teal-600" />
          Tìm thấy <b className="text-slate-800 dark:text-slate-200">{facilities.length}</b> cơ sở y tế
        </span>
        <span>Sắp xếp theo cự ly gần nhất</span>
      </div>

      <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
        {facilities.map((fac) => (
          <FacilityCard
            key={fac.id}
            facility={fac}
            isSelected={selectedFacility?.id === fac.id}
            onSelect={onSelectFacility}
          />
        ))}
      </div>
    </div>
  );
}

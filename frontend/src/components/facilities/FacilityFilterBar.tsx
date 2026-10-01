"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FacilitySpecialty } from "@/types/facility";
import { LocateFixed, Filter, MapPin, Loader2 } from "lucide-react";

interface FacilityFilterBarProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedSpecialty: FacilitySpecialty | "ALL";
  onSpecialtyChange: (specialty: FacilitySpecialty | "ALL") => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onGetCurrentLocation: () => void;
  isLocating: boolean;
  availableCities: string[];
}

/**
 * Thanh công cụ bộ lọc chuyên khoa, bán kính quét và nút định vị GPS (FR-23, FR-24).
 */
export function FacilityFilterBar({
  selectedCity,
  onCityChange,
  selectedSpecialty,
  onSpecialtyChange,
  radiusKm,
  onRadiusChange,
  onGetCurrentLocation,
  isLocating,
  availableCities,
}: FacilityFilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Chọn Tỉnh / Thành phố */}
          <div className="w-[180px]">
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800">
                <MapPin className="w-4 h-4 text-teal-600 mr-1.5 shrink-0" />
                <SelectValue placeholder="Chọn thành phố" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lọc theo chuyên khoa y tế */}
          <div className="w-[200px]">
            <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800">
                <Filter className="w-4 h-4 text-teal-600 mr-1.5 shrink-0" />
                <SelectValue placeholder="Chuyên khoa" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Tất cả chuyên khoa</SelectItem>
                <SelectItem value="ENDOCRINOLOGY">Nội tiết & Tiểu đường</SelectItem>
                <SelectItem value="CARDIOLOGY">Tim mạch & Huyết áp</SelectItem>
                <SelectItem value="STROKE_NEUROLOGY">Đột quỵ & Thần kinh</SelectItem>
                <SelectItem value="GENERAL_HOSPITAL">Đa khoa tuyến cuối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Nút bấm định vị GPS 1 chạm */}
        <Button
          onClick={onGetCurrentLocation}
          disabled={isLocating}
          variant="outline"
          className="h-11 px-4 rounded-xl border-teal-300 text-teal-700 bg-teal-50/50 hover:bg-teal-100 hover:text-teal-800 dark:border-teal-800 dark:text-teal-300 dark:bg-teal-950/30 transition-all shrink-0"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-teal-600" />
          ) : (
            <LocateFixed className="w-4 h-4 mr-2 text-teal-600" />
          )}
          {isLocating ? "Đang định vị GPS..." : "Vị trí của tôi"}
        </Button>
      </div>

      {/* Thanh trượt chọn bán kính quét (km) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bán kính quét:</span>
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
            {radiusKm} km
          </span>
        </div>
        <div className="flex-1 max-w-xs">
          <Slider
            value={[radiusKm]}
            min={3}
            max={50}
            step={1}
            onValueChange={(val) => onRadiusChange(val[0])}
            className="py-1"
          />
        </div>
      </div>
    </div>
  );
}

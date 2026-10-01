"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NearbyFacilityItem } from "@/types/facility";
import { PhoneCall, Navigation, Clock, MapPin, Building2 } from "lucide-react";

interface FacilityCardProps {
  facility: NearbyFacilityItem;
  isSelected?: boolean;
  onSelect?: (facility: NearbyFacilityItem) => void;
}

const SPECIALTY_CONFIG: Record<string, { label: string; className: string }> = {
  ENDOCRINOLOGY: { label: "Nội tiết & Tiểu đường", className: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300" },
  CARDIOLOGY: { label: "Tim mạch & Huyết áp", className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300" },
  STROKE_NEUROLOGY: { label: "Đột quỵ & Thần kinh", className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300" },
  GENERAL_HOSPITAL: { label: "Đa khoa tuyến cuối", className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300" },
};

/**
 * Thẻ hiển thị thông tin bệnh viện kèm khoảng cách thực tế và hotline cấp cứu (FR-25).
 */
export function FacilityCard({ facility, isSelected = false, onSelect }: FacilityCardProps) {
  const spec = SPECIALTY_CONFIG[facility.specialty] || { label: facility.specialty, className: "bg-slate-100 text-slate-700" };

  return (
    <Card
      onClick={() => onSelect?.(facility)}
      className={`cursor-pointer transition-all duration-200 rounded-xl hover:shadow-md border ${
        isSelected
          ? "border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 shadow-sm ring-1 ring-teal-500"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      }`}
    >
      <CardContent className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-1">
              {facility.name}
            </h4>
            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge variant="outline" className={`text-[11px] font-medium py-0 px-2 rounded-md ${spec.className}`}>
                {spec.label}
              </Badge>
              <Badge variant="secondary" className="text-[11px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {facility.facility_tier === "CENTRAL" ? "Tuyến Trung ương" : facility.facility_tier === "PROVINCIAL" ? "Tuyến Tỉnh/TP" : "Tư nhân"}
              </Badge>
            </div>
          </div>
          <span className="shrink-0 text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-1 rounded-lg border border-teal-100 dark:border-teal-900">
            {facility.distance_km} km
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5 line-clamp-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{facility.address}</span>
        </p>

        {facility.opening_hours && (
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{facility.opening_hours}</span>
          </p>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {facility.emergency_phone ? (
            <a
              href={`tel:${facility.emergency_phone.replace(/\s+/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 px-2.5 py-1.5 rounded-lg transition-colors min-h-[36px]"
              title="Gọi cấp cứu 24/7"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{facility.emergency_phone}</span>
            </a>
          ) : (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Cơ sở y tế
            </span>
          )}

          <Button
            size="sm"
            variant="outline"
            className="text-xs font-medium border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 min-h-[36px] px-3 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              window.open(facility.google_maps_url, "_blank", "noopener,noreferrer");
            }}
          >
            <Navigation className="w-3.5 h-3.5 mr-1" /> Chỉ đường
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

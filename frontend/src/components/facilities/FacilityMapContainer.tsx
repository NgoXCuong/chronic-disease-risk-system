"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { NearbyFacilityItem } from "@/types/facility";
import { MapPin } from "lucide-react";

const LeafletMap = dynamic(
  () => import("@/components/facilities/FacilityLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-3 p-6 text-slate-500">
        <MapPin className="w-8 h-8 text-teal-600 animate-bounce" />
        <span className="text-sm font-medium">Đang tải bản đồ cơ sở y tế OpenStreetMap...</span>
        <Skeleton className="w-48 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    ),
  }
);

interface FacilityMapContainerProps {
  userLocation: { latitude: number; longitude: number };
  radiusKm: number;
  facilities: NearbyFacilityItem[];
  selectedFacility: NearbyFacilityItem | null;
  onSelectFacility: (facility: NearbyFacilityItem) => void;
  onMapClick?: (coords: { latitude: number; longitude: number }) => void;
}

/**
 * Container bọc Leaflet Map với dynamic import ssr: false chống lỗi render máy chủ Next.js.
 */
export function FacilityMapContainer(props: FacilityMapContainerProps) {
  return (
    <div className="relative w-full h-[450px] lg:h-[620px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50">
      <LeafletMap {...props} />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { NearbyFacilityItem } from "@/types/facility";

interface FacilityLeafletMapProps {
  userLocation: { latitude: number; longitude: number };
  radiusKm: number;
  facilities: NearbyFacilityItem[];
  selectedFacility: NearbyFacilityItem | null;
  onSelectFacility: (facility: NearbyFacilityItem) => void;
  onMapClick?: (coords: { latitude: number; longitude: number }) => void;
}

const PIN_COLORS: Record<string, string> = {
  ENDOCRINOLOGY: "#0d9488", // Teal
  CARDIOLOGY: "#e11d48",    // Rose
  STROKE_NEUROLOGY: "#7c3aed", // Purple
  GENERAL_HOSPITAL: "#0284c7", // Sky
};

/**
 * Bản đồ tương tác Leaflet.js hiển thị vị trí người dùng và bệnh viện chuyên khoa (FR-24).
 */
export default function FacilityLeafletMap({
  userLocation,
  radiusKm,
  facilities,
  selectedFacility,
  onSelectFacility,
  onMapClick,
}: FacilityLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Khởi tạo bản đồ OpenStreetMap duy nhất một lần
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [userLocation.latitude, userLocation.longitude],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick?.({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    });

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Cập nhật Marker và Vùng quét Bán kính khi dữ liệu thay đổi
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Marker Vị trí người dùng (Pulsing Circle)
    const userPin = L.divIcon({
      className: "custom-user-pin",
      html: `<div class="relative flex items-center justify-center w-7 h-7">
               <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
               <span class="relative inline-flex rounded-full h-4 w-4 bg-teal-600 border-2 border-white shadow-md"></span>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker([userLocation.latitude, userLocation.longitude], { icon: userPin })
      .bindPopup("<div class='font-bold text-xs text-teal-800 p-1'>📍 Vị trí của bạn</div>")
      .addTo(layer);

    // Vòng tròn thể hiện bán kính quét
    L.circle([userLocation.latitude, userLocation.longitude], {
      color: "#0d9488",
      fillColor: "#14b8a6",
      fillOpacity: 0.08,
      weight: 1.5,
      radius: radiusKm * 1000,
    }).addTo(layer);

    // 2. Marker các cơ sở y tế
    facilities.forEach((fac) => {
      const color = PIN_COLORS[fac.specialty] || "#0d9488";
      const isSel = selectedFacility?.id === fac.id;
      const facPin = L.divIcon({
        className: "custom-hospital-pin",
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full shadow-md text-white font-bold text-xs transition-transform ${isSel ? 'scale-125 ring-2 ring-white ring-offset-2' : 'hover:scale-110'}" style="background-color: ${color};">
                🏥
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon: facPin })
        .bindPopup(
          `<div class="p-1 space-y-1 font-sans">
             <b class="text-xs font-semibold text-slate-900">${fac.name}</b>
             <p class="text-[11px] text-slate-500">${fac.address}</p>
             <span class="inline-block text-[11px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Cách bạn: ${fac.distance_km} km</span>
           </div>`
        )
        .addTo(layer);

      marker.on("click", () => onSelectFacility(fac));
      if (isSel) marker.openPopup();
    });

    // Tự động điều chỉnh khung nhìn nếu chọn cơ sở y tế cụ thể
    if (selectedFacility) {
      map.panTo([selectedFacility.latitude, selectedFacility.longitude], { animate: true });
    } else {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  }, [userLocation, radiusKm, facilities, selectedFacility]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[400px] rounded-2xl z-0" />;
}

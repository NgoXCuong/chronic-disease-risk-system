"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  ENDOCRINOLOGY: "#0d9488",    // Teal
  CARDIOLOGY: "#e11d48",       // Rose
  STROKE_NEUROLOGY: "#7c3aed", // Purple
  GENERAL_HOSPITAL: "#0284c7", // Sky
};

/**
 * Bản đồ tương tác Leaflet.js hiển thị vị trí người dùng và bệnh viện chuyên khoa (FR-24).
 * Sử dụng dịch vụ gạch bản đồ CartoDB Voyager dựa trên OpenStreetMap với độ ổn định cao.
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

  // 1. Khởi tạo bản đồ CartoDB Voyager / OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([userLocation.latitude, userLocation.longitude], 13);

    // Sử dụng CartoDB Voyager tile server: tải nhanh, không bị chặn kết nối và hiển thị rõ địa danh Việt Nam
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClick?.({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    });

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Kích hoạt invalidateSize để tránh lỗi bản đồ màu xám do container co giãn
    const initTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Cập nhật Marker và Vùng quét Bán kính khi dữ liệu thay đổi
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // Marker Vị trí người dùng (Pulsing Pin)
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
      .bindPopup(
        "<div style='font-size: 12px; font-weight: bold; color: #0f766e; padding: 2px;'>📍 Vị trí hiện tại của bạn</div>"
      )
      .addTo(layer);

    // Vòng tròn thể hiện bán kính quét
    L.circle([userLocation.latitude, userLocation.longitude], {
      color: "#0d9488",
      fillColor: "#14b8a6",
      fillOpacity: 0.08,
      weight: 1.5,
      radius: radiusKm * 1000,
    }).addTo(layer);

    // Marker các cơ sở y tế
    facilities.forEach((fac) => {
      const color = PIN_COLORS[fac.specialty] || "#0d9488";
      const isSel = selectedFacility?.id === fac.id;
      const facPin = L.divIcon({
        className: "custom-hospital-pin",
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg text-white font-bold text-xs transition-transform ${
          isSel ? "scale-125 ring-3 ring-white ring-offset-2 ring-offset-teal-600" : "hover:scale-110"
        }" style="background-color: ${color};">
                🏥
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupHtml = `
        <div style="max-width: 220px; font-family: sans-serif; padding: 2px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 3px; line-height: 1.3;">${fac.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; line-height: 1.3;">${fac.address}</div>
          <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #0d9488; background: #f0fdfa; padding: 2px 8px; border-radius: 6px; border: 1px solid #ccfbf1;">
            📍 Cách bạn: ${fac.distance_km} km
          </span>
        </div>
      `;

      const marker = L.marker([fac.latitude, fac.longitude], { icon: facPin })
        .bindPopup(popupHtml, { maxWidth: 260 })
        .addTo(layer);

      marker.on("click", () => onSelectFacility(fac));
      if (isSel) marker.openPopup();
    });

    // Tự động điều chỉnh khung nhìn
    if (selectedFacility) {
      map.flyTo([selectedFacility.latitude, selectedFacility.longitude], 14, { duration: 0.8 });
    } else {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
    }

    map.invalidateSize();
  }, [userLocation, radiusKm, facilities, selectedFacility]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[400px] rounded-2xl z-0" />;
}

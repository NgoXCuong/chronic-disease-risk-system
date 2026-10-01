"use client";

import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatFloatingButton } from "@/components/chat/ChatFloatingButton";
import { FacilityFilterBar } from "@/components/facilities/FacilityFilterBar";
import { FacilityMapContainer } from "@/components/facilities/FacilityMapContainer";
import { FacilityList } from "@/components/facilities/FacilityList";
import { getNearbyFacilities, getAvailableCities } from "@/lib/api/facilities";
import { FacilitySpecialty, NearbyFacilityItem } from "@/types/facility";
import { MapPin, ShieldCheck, HeartHandshake } from "lucide-react";

// Tọa độ trung tâm các đô thị trọng điểm phục vụ định vị nhanh
const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  "Hà Nội": { latitude: 21.0285, longitude: 105.8542 },
  "TP. Hồ Chí Minh": { latitude: 10.7769, longitude: 106.7009 },
  "Đà Nẵng": { latitude: 16.0544, longitude: 108.2022 },
  "Cần Thơ": { latitude: 10.0452, longitude: 105.7469 },
};

/**
 * Trang Bản đồ & Định vị Cơ sở Y tế Chuyên khoa (Sprint 17: FR-23 -> FR-25).
 */
export default function FacilitiesPage() {
  const [selectedCity, setSelectedCity] = useState<string>("Hà Nội");
  const [availableCities, setAvailableCities] = useState<string[]>(["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>(CITY_COORDINATES["Hà Nội"]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<FacilitySpecialty | "ALL">("ALL");
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [facilities, setFacilities] = useState<NearbyFacilityItem[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<NearbyFacilityItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Tải danh mục thành phố từ CSDL
  useEffect(() => {
    getAvailableCities()
      .then((cities) => {
        if (cities.length > 0) setAvailableCities(cities);
      })
      .catch(() => {});
  }, []);

  // Truy vấn danh sách bệnh viện lân cận khi thay đổi tọa độ, bán kính hoặc chuyên khoa
  const fetchFacilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getNearbyFacilities({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius_km: radiusKm,
        specialty: selectedSpecialty === "ALL" ? undefined : selectedSpecialty,
        limit: 30,
      });
      setFacilities(res.facilities);
      if (res.facilities.length > 0 && !selectedFacility) {
        setSelectedFacility(res.facilities[0]);
      }
    } catch (e) {
      console.error("Lỗi khi tải cơ sở y tế:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, radiusKm, selectedSpecialty]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // Xử lý chuyển đổi thành phố nhanh
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const coords = CITY_COORDINATES[city];
    if (coords) {
      setUserLocation(coords);
    }
  };

  // Định vị vị trí thực tế của thiết bị qua HTML5 Geolocation API (FR-23)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị vị trí GPS.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("Không thể lấy vị trí GPS:", err.message);
        alert("Không thể truy cập GPS. Vui lòng kiểm tra quyền chia sẻ vị trí của trình duyệt.");
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Tiêu đề & Giới thiệu chuẩn y tế */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-xs tracking-wider uppercase">
            <HeartHandshake className="w-4 h-4" /> Mạng Lưới Cơ Sở Y Tế Chuyên Khoa
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Bản Đồ & Định Vị Bệnh Viện Chuyên Khoa
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            Định vị các bệnh viện, viện tim mạch, nội tiết và trung tâm đột quỵ não gần bạn nhất với OpenStreetMap.
          </p>
        </div>

        {/* Thanh công cụ lọc và định vị GPS */}
        <FacilityFilterBar
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          selectedSpecialty={selectedSpecialty}
          onSpecialtyChange={setSelectedSpecialty}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          onGetCurrentLocation={handleGetCurrentLocation}
          isLocating={isLocating}
          availableCities={availableCities}
        />

        {/* Bố cục 2 cột: Danh sách thẻ bệnh viện (Trái) & Bản đồ tương tác Leaflet (Phải) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <FacilityList
              facilities={facilities}
              selectedFacility={selectedFacility}
              onSelectFacility={setSelectedFacility}
              isLoading={isLoading}
              radiusKm={radiusKm}
            />
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 sticky top-20">
            <FacilityMapContainer
              userLocation={userLocation}
              radiusKm={radiusKm}
              facilities={facilities}
              selectedFacility={selectedFacility}
              onSelectFacility={setSelectedFacility}
              onMapClick={(coords) => setUserLocation(coords)}
            />
          </div>
        </div>
      </main>

      <Footer />
      <ChatFloatingButton />
    </div>
  );
}

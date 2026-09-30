"use client";

import * as React from "react";
import { Navbar } from "@/components/common/Navbar";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeModelsSection } from "@/components/home/HomeModelsSection";
import { screeningApi } from "@/lib/api/screening";
import { LoadedModel } from "@/types/screening";

export default function HomePage() {
  const [models, setModels] = React.useState<LoadedModel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        // Nạp dữ liệu mô hình thực tế từ Backend (kèm In-Memory Cache)
        const data = await screeningApi.getModels();
        setModels(data);
      } catch (err: any) {
        console.warn("Lỗi tải thông tin mô hình từ Backend:", err?.response?.data || err.message);
        setError("Chưa kết nối được máy chủ AI backend. Vui lòng đảm bảo Backend FastAPI đang hoạt động.");
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Thông báo pháp lý y tế trên thanh đầu trang */}
      <MedicalDisclaimer variant="banner" />

      {/* Thanh điều hướng chính */}
      <Navbar />

      {/* Nội dung chính trang chủ */}
      <main className="flex-1">
        {/* Phần giới thiệu & Thống kê nhanh */}
        <HomeHeroSection loading={loading} modelsCount={models.length} />

        {/* Danh sách 5 phân hệ mô hình học máy */}
        <HomeModelsSection loading={loading} error={error} models={models} />

        {/* Khung tuyên bố miễn trừ trách nhiệm y tế */}
        <section className="py-12 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/60 dark:border-slate-800/80 transition-colors">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <MedicalDisclaimer />
          </div>
        </section>
      </main>

      {/* Chân trang */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MedRisk AI — Đồ án Tốt nghiệp Đại học ngành Công nghệ Thông tin.</p>
          <p className="text-slate-400 dark:text-slate-500">
            Hệ thống hỗ trợ ra quyết định lâm sàng (CDSS) cá nhân hóa.
          </p>
        </div>
      </footer>
    </div>
  );
}

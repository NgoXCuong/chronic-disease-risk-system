"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Stethoscope } from "lucide-react";

import { Navbar } from "@/components/common/Navbar";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { LatestScreeningCard } from "@/components/dashboard/LatestScreeningCard";
import { AIModelsGrid } from "@/components/dashboard/AIModelsGrid";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { LoadedModel } from "@/types/screening";

export default function DashboardPage() {
  const { user } = useAuth();
  const [models, setModels] = React.useState<LoadedModel[]>([]);
  const [history, setHistory] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [modelsRes, historyRes] = await Promise.allSettled([
          api.get<LoadedModel[]>("/screening/models"),
          api.get("/screening/history?page=1&page_size=5"),
        ]);

        if (modelsRes.status === "fulfilled") setModels(modelsRes.value.data);
        if (historyRes.status === "fulfilled") setHistory(historyRes.value.data);
      } catch (err) {
        console.warn("Lỗi tải dữ liệu Dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const latestRecord = history?.records && history.records.length > 0 ? history.records[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <MedicalDisclaimer variant="banner" />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header Greeting & CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-medical-50 dark:bg-medical-950/80 text-medical-700 dark:text-medical-300 border border-medical-200 dark:border-medical-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400" />
              Bảng điều khiển Sức khỏe Cá nhân
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Xin chào, {user?.profile?.full_name || user?.email || "Bạn"}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Theo dõi biến thiên nguy cơ bệnh mạn tính và quản lý hồ sơ nhân trắc y tế
            </p>
          </div>

          <Link href="/screening">
            <Button size="lg" className="gap-2 shadow-md">
              <Stethoscope className="w-5 h-5" />
              Khảo sát Nguy cơ Mới
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* 3 Core Stats Cards */}
        <DashboardStatsGrid
          loading={loading}
          profile={user?.profile}
          totalScreenings={history?.total_records ?? 0}
          lastScreeningDate={latestRecord?.recorded_at}
          models={models}
        />

        {/* Latest Screening Assessment */}
        <LatestScreeningCard
          loading={loading}
          latestRecord={latestRecord}
          totalRecords={history?.total_records ?? 0}
        />

        {/* 5 Calibrated AI Models Grid */}
        <AIModelsGrid loading={loading} models={models} />
      </main>
    </div>
  );
}

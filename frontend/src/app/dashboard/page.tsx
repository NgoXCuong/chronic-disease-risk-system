"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, UserPlus, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usersApi } from "@/lib/api/users";
import { screeningApi } from "@/lib/api/screening";
import { PatientProfile } from "@/types/auth";
import { ScreeningHistoryItem } from "@/types/screening";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardVitalsCard } from "@/components/dashboard/DashboardVitalsCard";
import { LatestRiskOverview } from "@/components/dashboard/LatestRiskOverview";
import { TrajectoryChartCard } from "@/components/dashboard/TrajectoryChartCard";
import { RecentScreeningsCard } from "@/components/dashboard/RecentScreeningsCard";
import { DashboardRecommendations } from "@/components/dashboard/DashboardRecommendations";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<ScreeningHistoryItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    setDataLoading(true);

    Promise.allSettled([
      usersApi.getProfile(),
      screeningApi.getHistory(1, 5),
    ]).then(([profileRes, historyRes]) => {
      if (!isMounted) return;
      if (profileRes.status === "fulfilled") setProfile(profileRes.value);
      if (historyRes.status === "fulfilled") setRecords(historyRes.value?.items || []);
      setDataLoading(false);
    });

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  if (authLoading || (isAuthenticated && dataLoading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center space-y-5">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">Yêu cầu Đăng nhập</h1>
          <p className="text-xs text-slate-500">Đăng nhập tài khoản để theo dõi chuỗi thời gian sức khỏe và lịch sử sàng lọc.</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/login">
            <Button className="h-11 min-h-[44px] px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer">
              <LogIn className="h-4 w-4" /> Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="h-11 min-h-[44px] px-5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <UserPlus className="h-4 w-4" /> Đăng ký mới
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <DashboardHeader fullName={profile?.full_name || user?.profile?.full_name} email={user?.email} lastUpdated={profile?.updated_at} />
        <DashboardVitalsCard profile={profile || user?.profile} />
        <LatestRiskOverview latestRecord={records[0] || null} />
        <TrajectoryChartCard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentScreeningsCard records={records} />
          <DashboardRecommendations />
        </div>
      </div>
    </div>
  );
}

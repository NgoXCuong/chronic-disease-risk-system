"use client";

import React, { useState } from "react";
import Link from "next/link";
import { History, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { ScreeningTimelineList } from "@/components/history/ScreeningTimelineList";
import { LongitudinalSection } from "@/components/history/LongitudinalSection";

export default function HistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [tab, setTab] = useState("timeline");

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center mx-auto">
          <History className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Yêu cầu Đăng nhập</h2>
        <p className="text-xs text-slate-500">
          Vui lòng đăng nhập tài khoản để xem lại toàn bộ lịch sử các đợt sàng lọc và theo dõi biểu đồ diễn tiến nguy cơ.
        </p>
        <Link href="/login" className="block pt-2">
          <Button className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs">
            Đăng nhập ngay
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <History className="h-6 w-6 text-teal-600" /> Lịch sử Sàng lọc & Diễn tiến Nguy cơ
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi chuỗi thời gian, phân tích biến thiên điểm rủi ro và xuất phiếu báo cáo y tế định dạng PDF.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="h-11 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="timeline" className="h-9 px-4 text-xs font-bold rounded-lg flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" /> Dòng thời gian Khảo sát
          </TabsTrigger>
          <TabsTrigger value="trajectory" className="h-9 px-4 text-xs font-bold rounded-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-600" /> Biểu đồ Diễn tiến Nguy cơ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <ScreeningTimelineList />
        </TabsContent>

        <TabsContent value="trajectory" className="space-y-4">
          <LongitudinalSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

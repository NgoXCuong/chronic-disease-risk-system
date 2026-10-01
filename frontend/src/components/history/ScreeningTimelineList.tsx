"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { ScreeningHistoryResponse, HealthRecordDetailResponse } from "@/types/screening";
import { screeningApi } from "@/lib/api/screening";
import { ScreeningTimelineCard } from "./ScreeningTimelineCard";
import { ScreeningDetailModal } from "./ScreeningDetailModal";

export function ScreeningTimelineList() {
  const [data, setData] = useState<ScreeningHistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecordDetailResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchHistory = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await screeningApi.getHistory(p, 5);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(page); }, [fetchHistory, page]);

  const handleViewDetail = async (recordId: string) => {
    try {
      const detail = await screeningApi.getHistoryById(recordId);
      setSelectedRecord(detail);
      setModalOpen(true);
    } catch (e) {
      console.error("Lỗi khi tải chi tiết hồ sơ:", e);
    }
  };

  const handleDownloadPdf = async (recordId: string) => {
    setDownloadingId(recordId);
    try {
      await screeningApi.downloadScreeningPdf(recordId);
    } catch (e) {
      console.error("Lỗi khi xuất PDF:", e);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}</div>;

  if (!data?.items?.length) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <ClipboardCheck className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có lịch sử sàng lọc</h4>
        <p className="text-xs text-slate-500">Thực hiện bài khảo sát nguy cơ mới để ghi nhận vào hồ sơ cá nhân.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.items.map((item) => (
        <ScreeningTimelineCard
          key={item.record_id}
          item={item}
          onViewDetail={handleViewDetail}
          onDownloadPdf={handleDownloadPdf}
          isDownloading={downloadingId === item.record_id}
        />
      ))}

      {data.total_pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">Trang {data.page} / {data.total_pages} (Tổng {data.total} đợt khám)</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 rounded-lg text-xs">
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Trang trước
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)} className="h-8 rounded-lg text-xs">
              Trang sau <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <ScreeningDetailModal
        record={selectedRecord}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDownloadPdf={handleDownloadPdf}
        isDownloading={downloadingId === selectedRecord?.id}
      />
    </div>
  );
}

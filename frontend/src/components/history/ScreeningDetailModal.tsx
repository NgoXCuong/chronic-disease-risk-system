"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDown, Loader2 } from "lucide-react";
import { HealthRecordDetailResponse } from "@/types/screening";
import { ScreeningResultsDetailView } from "./ScreeningResultsDetailView";

interface Props {
  record: HealthRecordDetailResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadPdf: (recordId: string) => void;
  isDownloading: boolean;
}

export function ScreeningDetailModal({ record, open, onOpenChange, onDownloadPdf, isDownloading }: Props) {
  if (!record) return null;

  const dateStr = new Date(record.created_at).toLocaleString("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 rounded-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Hồ sơ Sàng lọc Chi tiết #{record.id.slice(0, 8)}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Thời điểm thực hiện: {dateStr}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-3 max-h-[60vh]">
          <ScreeningResultsDetailView record={record} />
        </ScrollArea>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl text-xs h-9">
            Đóng
          </Button>
          <Button
            size="sm"
            disabled={isDownloading}
            onClick={() => onDownloadPdf(record.id)}
            className="rounded-xl text-xs h-9 bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
          >
            {isDownloading ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Đang tạo PDF...</>
            ) : (
              <><FileDown className="h-3.5 w-3.5 mr-1.5" /> Xuất phiếu PDF</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

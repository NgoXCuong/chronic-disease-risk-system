import React from "react";
import { ShieldAlert, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DisclaimerConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-slate-200 dark:border-slate-800">
        <DialogHeader className="text-left space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/60">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
            Cam kết Miễn trừ Trách nhiệm Y tế
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Hệ thống <strong>ChronicCare CDSS</strong> sử dụng 5 mô hình Trí tuệ Nhân tạo (Machine Learning) được hiệu chỉnh xác suất để phân tích nguy cơ tiềm ẩn.
          </DialogDescription>
        </DialogHeader>

        {/* Khối cảnh báo y khoa */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 leading-relaxed space-y-1.5">
          <p className="font-bold text-[11px] uppercase tracking-wide text-amber-800 dark:text-amber-400">
            * Nguyên tắc An toàn Lâm sàng:
          </p>
          <p className="text-[11px]">
            1. Kết quả chỉ mang tính sàng lọc, phát hiện nguy cơ sớm và hỗ trợ nhận thức sức khỏe.
          </p>
          <p className="text-[11px]">
            2. Điểm số tuyệt đối <strong>không thay thế chẩn đoán bệnh của bác sĩ chuyên khoa</strong> hay kết quả xét nghiệm tại cơ sở y tế.
          </p>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11 min-h-[44px] rounded-xl text-xs font-semibold"
          >
            Xem lại thông tin
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="w-full sm:w-auto h-11 min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2 shadow-sm shadow-teal-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang nạp 5 mô hình AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Tôi đã hiểu & Phân tích ngay
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

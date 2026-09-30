"use client";

import * as React from "react";
import { AlertCircle, ArrowRight, BrainCircuit, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface DisclaimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DisclaimerModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: DisclaimerModalProps) {
  const [agreed, setAgreed] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogCloseButton onClose={() => onOpenChange(false)} />

      <DialogHeader>
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto sm:mx-0 mb-2">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <DialogTitle>Xác nhận Khảo sát &amp; Miễn trừ Trách nhiệm Y tế</DialogTitle>
        <DialogDescription>
          Vui lòng đọc kỹ thông cáo pháp lý y tế trước khi hệ thống AI thực thi suy luận và lưu trữ kết quả.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <Alert variant="warning">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription>
            Hệ thống MedRisk AI là công cụ <strong>Hỗ trợ ra quyết định cá nhân (CDSS)</strong>. Kết quả điểm rủi ro chỉ mang tính cảnh báo sớm và nâng cao nhận thức, <strong>tuyệt đối không thay thế chẩn đoán lâm sàng, kết luận hoặc đơn thuốc của bác sĩ</strong>.
          </AlertDescription>
        </Alert>

        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Bảo mật PHI/PII:</strong> Dữ liệu thể trạng và sức khỏe của bạn được bảo vệ riêng tư theo chuẩn Row-Level Authorization, chỉ duy nhất bạn có quyền xem.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <BrainCircuit className="w-4 h-4 text-medical-600 shrink-0 mt-0.5" />
            <span>
              <strong>Mô hình Hiệu chuẩn:</strong> Điểm số được tính toán dựa trên các thuật toán XGBoost đã hiệu chuẩn xác suất và phân tích định lượng bằng SHAP XAI.
            </span>
          </div>
        </div>

        <div
          className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/60 select-none cursor-pointer transition-colors"
          onClick={() => setAgreed(!agreed)}
        >
          <Checkbox
            id="medical-consent"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="medical-consent"
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer leading-snug"
          >
            Tôi đã đọc, hiểu rõ tuyên bố y tế và xác nhận các chỉ số cung cấp là chính xác để phân tích nguy cơ.
          </label>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Quay lại chỉnh sửa
        </Button>
        <Button
          type="button"
          disabled={!agreed || isSubmitting}
          onClick={onConfirm}
          className="gap-2 shadow-md"
        >
          {isSubmitting ? (
            "Đang phân tích AI..."
          ) : (
            <>
              Xác nhận &amp; Phân tích Nguy cơ <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
